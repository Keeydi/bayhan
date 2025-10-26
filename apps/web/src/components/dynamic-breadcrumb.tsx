'use client'

import type React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { pathToRegexp } from 'path-to-regexp'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@components/ui/breadcrumb'

export interface PatternConfig {
    pattern: string
    label?: string
    replacements?: Record<string, string>
    excludeValues?: Record<string, string[]> // Exclude specific values for parameters
}

interface DynamicBreadcrumbProps {
    homeElement?: React.ReactNode
    homePath?: string
    showHome?: boolean
    separator?: React.ReactNode
    containerClasses?: string
    listClasses?: string
    activeClasses?: string
    capitalizeLinks?: boolean
    patterns?: PatternConfig[]
}

const DynamicBreadcrumb = ({
    homeElement = 'Home',
    homePath = '/',
    showHome = true,
    separator,
    containerClasses,
    listClasses,
    activeClasses,
    capitalizeLinks = true,
    patterns = []
}: DynamicBreadcrumbProps) => {
    const pathname = usePathname()

    const formatSegment = (segment: string) => {
        let formatted = segment.replace(/[-_]/g, ' ')

        if (capitalizeLinks) {
            formatted = formatted
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
        }

        return formatted
    }

    const findBestMatchingPattern = (path: string) => {
        let bestMatch = null
        let bestMatchLength = 0

        for (const config of patterns) {
            const { regexp, keys } = pathToRegexp(config.pattern)
            const match = regexp.exec(path)

            if (match) {
                let isValidMatch = true
                const params: Record<string, string> = {}

                // Check exclusions
                keys.forEach((key, index) => {
                    const paramName = key.name
                    const matchedValue = match[index + 1]

                    if (!matchedValue) {
                        isValidMatch = false
                        return
                    }

                    params[paramName] = matchedValue

                    if (config.excludeValues &&
                        config.excludeValues[paramName] &&
                        config.excludeValues[paramName].includes(matchedValue)) {
                        isValidMatch = false
                    }
                })

                if (isValidMatch) {
                    const matchLength = config.pattern.split('/').filter(s => s !== '').length
                    if (matchLength > bestMatchLength) {
                        bestMatch = { config, params, keys, matchLength }
                        bestMatchLength = matchLength
                    }
                }
            }
        }
        return bestMatch
    }

    const buildBreadcrumbSegments = () => {
        const pathSegments = pathname.split('/').filter((segment) => segment !== '')
        const breadcrumbSegments: Array<{
            label: string
            href: string
            isLast: boolean
        }> = []

        let matchedPattern = null
        let matchedParams: Record<string, string> = {}

        for (let i = pathSegments.length; i > 0; i--) {
            const partialPath = '/' + pathSegments.slice(0, i).join('/')
            const match = findBestMatchingPattern(partialPath)
            if (match) {
                matchedPattern = match.config
                matchedParams = match.params
                break
            }
        }

        pathSegments.forEach((segment, index) => {
            const currentPath = '/' + pathSegments.slice(0, index + 1).join('/')
            let label: string
            let href = currentPath

            if (matchedPattern) {
                const patternSegments = matchedPattern.pattern.split('/').filter(s => s !== '')

                if (index < patternSegments.length) {
                    const patternSegment = patternSegments[index]

                    if (patternSegment?.startsWith(':')) {
                        const paramName = patternSegment.slice(1)
                        const paramValue = matchedParams[paramName]

                        if (matchedPattern.replacements && matchedPattern.replacements[paramName]) {
                            label = matchedPattern.replacements[paramName]
                        } else {
                            label = formatSegment(paramValue || segment)
                        }
                    } else {
                        if (index === patternSegments.length - 1 && matchedPattern.label) {
                            label = matchedPattern.label
                        } else {
                            label = formatSegment(segment)
                        }
                    }
                } else {
                    label = formatSegment(segment)
                }
            } else {
                label = formatSegment(segment)
            }

            breadcrumbSegments.push({
                label,
                href,
                isLast: index === pathSegments.length - 1
            })
        })

        return breadcrumbSegments
    }

    const breadcrumbSegments = buildBreadcrumbSegments()

    return (
        <Breadcrumb className={ containerClasses }>
            <BreadcrumbList className={ listClasses }>
                {/* Home link */ }
                { showHome && (
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={ homePath }>{ homeElement }</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                ) }

                {/* Path segments */ }
                { breadcrumbSegments.map((segment, index) => {
                    const needsSeparator = showHome || index > 0

                    return (
                        <div key={ `${ segment.href }-${ index }` } className='flex items-center gap-1.5'>
                            { needsSeparator && <BreadcrumbSeparator>{ separator }</BreadcrumbSeparator> }
                            <BreadcrumbItem>
                                { segment.isLast ? (
                                    <BreadcrumbPage className={ activeClasses }>
                                        { segment.label }
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={ segment.href }>{ segment.label }</Link>
                                    </BreadcrumbLink>
                                ) }
                            </BreadcrumbItem>
                        </div>
                    )
                }) }
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export default DynamicBreadcrumb