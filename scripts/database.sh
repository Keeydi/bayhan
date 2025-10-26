#!/bin/bash

# Database Management Script
# Usage: ./db.sh [option]

set -euo pipefail  # Exit on error, undefined vars, pipe failures

readonly PRISMA="prisma"

SCRIPT_NAME=$(basename "$0")
readonly SCRIPT_NAME

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

show_help() {
    cat << EOF
Usage: $SCRIPT_NAME [option]...

Database management utility for Prisma projects.

Options:
  -b,  --build            Build the database package
  -p,  --push             Push database schema changes
  -g,  --generate         Generate Prisma client
  -d,  --deploy           Deploy migrations to production
  -c,  --create <name>    Create a new migration with the given name
       --status           Show migration status
  -r,  --reset            Reset database (drops all data)
  -s,  --studio           Open Prisma Studio
  -m,  --migrate          Run database migrations in dev mode
  -S,  --seed [env]       Seed database (default: development)
       --format           Format the Prisma schema
       --validate         Validate the Prisma schema
       --version          Show Prisma version
  -h,  --help             Show this help message

Examples:
  $SCRIPT_NAME -p                    # Push schema changes
  $SCRIPT_NAME --generate            # Generate Prisma client
  $SCRIPT_NAME -s                    # Open Prisma Studio
  $SCRIPT_NAME --migrate             # Run migrations
  $SCRIPT_NAME -S production         # Seed production database
  $SCRIPT_NAME -gpm                  # Combined: generate, push, migrate
  $SCRIPT_NAME -rpg                  # Combined: reset, push, generate
  $SCRIPT_NAME -b                    # Build database package

Notes:
  • Multiple options can be combined and executed in order
  • Short options can be chained (e.g., -gpm = -g -p -m)
  • Options requiring arguments (-c, -S) cannot be combined
  • The script must be run from the project root or contain packages/database
  • DATABASE_URL environment variable must be set before running any database operations
EOF
}

# Database operation functions
build_database() {
    log_info "Building database package..."
    local current_dir
    current_dir=$(pwd)

    # Build in the database package directory
    if command -v yarn &> /dev/null; then
        yarn build
    elif command -v npm &> /dev/null; then
        npm run build
    else
        log_error "Neither yarn nor npm found. Please install one of them."
        return 1
    fi

    # Go back to project root and install dependencies
    cd ../..
    if command -v yarn &> /dev/null; then
        yarn install
    else
        npm install
    fi

    # Return to original directory
    cd "$current_dir"
    log_info "Database package build completed"
}

push_db() {
    log_info "Pushing database schema..."
    $PRISMA db push --skip-generate
}

generate_db() {
    log_info "Generating Prisma client..."
    $PRISMA generate
}

reset_db() {
    log_warn "Resetting database - ALL DATA WILL BE LOST!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        $PRISMA migrate reset --force --skip-seed --skip-generate
    else
        log_info "Database reset cancelled"
        return 0
    fi
}

studio_db() {
    log_info "Opening Prisma Studio..."
    $PRISMA studio
}

migrate_db() {
    log_info "Running database migrations..."
    $PRISMA migrate dev --skip-generate
}

seed_db() {
    local env=${1:-development}
    log_info "Seeding database for environment: $env"
    NODE_ENV="$env" $PRISMA db seed
}

deploy_db() {
    log_info "Deploying migrations..."
    $PRISMA migrate deploy
}

create_migration() {
    local name="$1"
    if [[ -z "$name" ]]; then
        log_error "Migration name is required"
        return 1
    fi
    log_info "Creating migration: $name"
    $PRISMA migrate dev --name "$name" --skip-generate
}

status_db() {
    log_info "Checking migration status..."
    $PRISMA migrate status
}

format_schema() {
    log_info "Formatting Prisma schema..."
    $PRISMA format
}

validate_schema() {
    log_info "Validating Prisma schema..."
    $PRISMA validate
}

prisma_version() {
    log_info "Prisma version:"
    $PRISMA --version
}

process_combined_options() {
    local combined="$1"
    combined="${combined#-}"

    for (( i=0; i<${#combined}; i++ )); do
        local char="${combined:$i:1}"
        case "$char" in
            b) build_database ;;
            p) push_db ;;
            g) generate_db ;;
            r) reset_db ;;
            s) studio_db ;;
            m) migrate_db ;;
            d) deploy_db ;;
            h) show_help; exit 0 ;;
            *)
                log_error "Unknown option: -$char"
                log_error "Options -c and -S require arguments and cannot be combined"
                show_help
                exit 1
                ;;
        esac
    done
}

setup_working_directory() {
    if [[ -d "packages/database" ]]; then
        cd "packages/database" || {
            log_error "Cannot access packages/database directory"
            exit 1
        }
    elif [[ -f "prisma/schema.prisma" ]] || [[ -f "schema.prisma" ]]; then
        log_info "Using current directory (found Prisma schema)"
    else
        cd "$(dirname "$0")/.." 2>/dev/null || true
        if [[ -d "packages/database" ]]; then
            cd "packages/database" || {
                log_error "Cannot access packages/database directory"
                exit 1
            }
        else
            log_error "Cannot find Prisma project structure"
            log_error "Please run this script from the project root or a directory containing packages/database"
            exit 1
        fi
    fi
}

# Verify Prisma is available
check_prisma() {
    if ! command -v "$PRISMA" &> /dev/null; then
        log_error "Prisma CLI not found. Please install it first:"
        log_error "npm install -g prisma"
        exit 1
    fi
}

# Check for DATABASE_URL environment variable
check_database_url() {
    if [[ -z "${DATABASE_URL:-}" ]]; then
        log_error "DATABASE_URL environment variable is not set"
        log_error "Please set the DATABASE_URL environment variable before running database operations"
        log_error "Example: export DATABASE_URL='postgresql://user:password@localhost:5432/database'"
        exit 1
    fi
    
    log_info "Using DATABASE_URL: ${DATABASE_URL}"
}

main() {
    local ran_command=false

    check_prisma
    check_database_url
    setup_working_directory

    if [[ $# -eq 0 ]]; then
        log_error "No command specified"
        echo
        show_help
        exit 1
    fi

    while [[ $# -gt 0 ]]; do
        case $1 in
            -b|--build) build_database; ran_command=true ;;
            -p|--push) push_db; ran_command=true ;;
            -g|--generate) generate_db; ran_command=true ;;
            -r|--reset) reset_db; ran_command=true ;;
            -s|--studio) studio_db; ran_command=true ;;
            -m|--migrate) migrate_db; ran_command=true ;;
            -d|--deploy) deploy_db; ran_command=true ;;
            --status) status_db; ran_command=true ;;
            --format) format_schema; ran_command=true ;;
            --validate) validate_schema; ran_command=true ;;
            --version) prisma_version; ran_command=true ;;
            -h|--help) show_help; exit 0 ;;

            -c|--create)
                shift
                if [[ $# -eq 0 ]]; then
                    log_error "Migration name required for --create"
                    show_help
                    exit 1
                fi
                create_migration "$1"
                ran_command=true
                ;;

            -S|--seed)
                shift
                seed_db "$1"
                ran_command=true
                ;;

            # Combined short options
            -[a-zA-Z][a-zA-Z]*)
                if [[ "$1" == *c* ]] || [[ "$1" == *S* ]]; then
                    log_error "Options -c and -S require arguments and cannot be combined"
                    show_help
                    exit 1
                fi
                process_combined_options "$1"
                ran_command=true
                ;;

            *)
                log_error "Unknown option: $1"
                echo
                show_help
                exit 1
                ;;
        esac
        shift
    done

    if [[ "$ran_command" == false ]]; then
        log_error "No valid command executed"
        echo
        show_help
        exit 1
    fi
}

# Run main function with all arguments
main "$@"