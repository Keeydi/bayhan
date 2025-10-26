'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { FileInput, Input } from '@components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { ArrowLeft, ArrowRight, GalleryVerticalEnd } from 'lucide-react'
import { cn } from '@lib/utils'
import { z } from 'zod'
import { useSession } from '@lib/auth'
import { useApi } from '@hooks/use-api'
import { PhoneInput } from '@components/ui/phone-input'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { TARLAC_BARANGAYS } from '@lib/tarlac-barangays'
import { TarlacLocationPicker } from '@components/features/map'

const fileSchema = z.custom<File>(
    (file): file is File => {
        if (!(file instanceof File)) return false;
        if (file.type !== 'application/pdf') return false;
        if (file.size > 10 * 1024 * 1024) return false; // 10MB limit
        return true;
    },
    { message: 'File must be a PDF under 10MB' }
);

const volunteerTypeSchema = z.enum([
    'TYPE_1_SEARCH_RESCUE',
    'TYPE_2_EVACUATION_MOBILITY',
    'TYPE_3_WASAR',
    'TYPE_4_NOT_CERTIFIED'
]);

const registrationSchema = z
    .object({
        // Step 1: Personal Information
        firstName: z.string().trim().min(1, 'First name is required'),
        lastName: z.string().trim().min(1, 'Last name is required'),
        birthDate: z.iso.date('Birth date is required').transform(value => new Date(value).toISOString()),
        phone: z.string().min(1, 'Phone number is required').trim(),
        volunteerType: volunteerTypeSchema.optional(),

        // Step 2: Address Information - Barangay from dropdown
        street: z.string().trim().or(z.literal('')).optional(),
        barangay: z.string().trim().min(1, 'Please select a barangay'),
        city: z.string().trim().min(1, 'City is required'),
        state: z.string().trim().min(1, 'State is required'),
        zipCode: z.string().trim().min(1, 'ZIP code is required'),

        // Step 3: Document Upload - Optional
        accreditationFile: z.union([fileSchema, z.null()]).optional(),
        certificationFile: z.union([fileSchema, z.null()]).optional()
    })

type RegistrationFormData = z.infer<typeof registrationSchema>

export function Onboarding({ className, ...props }: React.ComponentProps<'div'>) {
    const [ currentStep, setCurrentStep ] = useState(1)
    const { data: session } = useSession();
    const api = useApi()
    const router = useRouter()

    const form = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        mode: 'onChange',
        defaultValues: {
            firstName: '',
            lastName: '',
            street: '',
            barangay: '',
            birthDate: '',
            phone: '',
            city: 'Tarlac City',
            state: 'Tarlac',
            zipCode: '',
            volunteerType: '' as any,
            accreditationFile: undefined,
            certificationFile: undefined
        }
    })

    const totalSteps = 3
    const progress = (currentStep / totalSteps) * 100

    const isSubmitting = form.formState.isSubmitting

    const validateStep = async (step: number): Promise<boolean> => {
        const fieldsToValidate = {
            1: [ 'firstName', 'lastName', 'birthDate', 'phone' ],
            2: [ 'barangay', 'city', 'state', 'zipCode' ],
            3: [] // Documents are optional
        }

        const fields = fieldsToValidate[step as keyof typeof fieldsToValidate] as (keyof RegistrationFormData)[]
        if (fields.length === 0) return true // Step 3 validation is optional
        return await form.trigger(fields)
    }

    const handleNext = async () => {
        const isValid = await validateStep(currentStep)
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
        }
    }

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }

    const onSubmit = async (formData: RegistrationFormData) => {
        const toastId = toast.loading('Completing your profile...');

        const { accreditationFile, certificationFile, ...remaining } = formData;
        const { street, barangay, city, state, zipCode, volunteerType, ...profileData } = remaining
        
        // Clean up empty strings and convert to proper format
        const addressData: any = {
            city,
            state,
            zipCode,
            street: street && street.trim() !== '' ? street : null,
            barangay: barangay && barangay.trim() !== '' ? barangay : null
        }
        
        // Clean volunteerType - convert empty string to undefined
        const cleanedVolunteerType = volunteerType && volunteerType.trim() !== '' ? volunteerType : undefined
        
        const cleanedData: any = {
            ...profileData,
            address: addressData,
            ...(cleanedVolunteerType && { volunteerType: cleanedVolunteerType })
        }

        console.log('Submitting data:', cleanedData)
        console.log('Phone format:', cleanedData.phone)
        
        try {
            const profileResponse = await api.post('/profile', cleanedData)

            if (!profileResponse.data?.success) {
                console.error('API error:', profileResponse.data)
                console.error('Validation errors:', JSON.stringify(profileResponse.data?.error, null, 2))
                toast.error(profileResponse.data?.message || 'Failed to complete profile. Please try again.', { id: toastId });
                return;
            }
        } catch (error: any) {
            console.error('Profile creation error:', error.response?.data)
            console.error('Error details:', error.response?.data?.error)
            const errorMsg = error.response?.data?.message || error.response?.data?.error?.map((e: any) => e.message || e).join(', ') || 'Invalid request body. Please check your form data.'
            toast.error(errorMsg, { id: toastId });
            return;
        }

        // Upload files only if they exist
        if (accreditationFile || certificationFile) {
            const uploadFormData = new FormData();
            if (accreditationFile) uploadFormData.append('ACCREDITATION', accreditationFile);
            if (certificationFile) uploadFormData.append('CERTIFICATION', certificationFile);

            const credentialsResponse = await api.post('/profile/credentials', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (!credentialsResponse.data?.success) {
                console.warn('File upload failed:', credentialsResponse.data.message);
                // Don't fail the entire registration if file upload fails
            }
        }

        toast.success('Profile created successfully! ' + (accreditationFile || certificationFile ? 'Your request will be reviewed.' : 'Please upload documents to complete your application.'), { id: toastId });
        router.push('/dashboard')
    }

    const stepLabels = [ 'Personal', 'Address', 'Documents' ]

    return (
        <div className={ cn('flex flex-col gap-6', className) } { ...props }>
            <Form { ...form }>
                <div
                    className='p-6 md:p-8 max-w-2xl mx-auto w-full'
                    onKeyDown={ async (e) => {
                        if (e.key === 'Enter') {
                            const target = e.target as HTMLElement;

                            if ([ 'TEXTAREA' ].includes(target.tagName)) return;

                            e.preventDefault();

                            if (currentStep === totalSteps) return
                            await handleNext();
                        }
                    } }
                >
                    <div className='flex flex-col gap-6'>
                        {/* Header */ }
                        <div className='flex flex-col items-center gap-2'>
                            <a
                                href='#'
                                className='flex flex-col items-center gap-2 font-medium'
                            >
                                <div className='flex size-8 items-center justify-center rounded-md'>
                                    <GalleryVerticalEnd className='size-6' />
                                </div>
                                <span className='sr-only'>E-Bayanihan</span>
                            </a>
                            <h1 className='text-xl font-bold'>Complete your profile</h1>
                            <div className='text-center text-sm'>
                                Please provide the following information to complete your account setup.
                            </div>
                        </div>

                        {/* Progress Indicator */ }
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between text-sm text-muted-foreground'>
                                <span>Step { currentStep } of { totalSteps }</span>
                                <span>{ stepLabels[currentStep - 1] }</span>
                            </div>

                            <div className='w-full h-2 bg-muted rounded-full'>
                                <div
                                    className='h-2 bg-primary rounded-full transition-all duration-300 ease-in-out'
                                    style={ { width: `${ progress }%` } }
                                />
                            </div>

                            <div className='flex justify-between text-xs'>
                                { stepLabels.map((label, index) => (
                                    <span
                                        key={ label }
                                        className={ cn(
                                            'transition-colors duration-300',
                                            currentStep > index + 1 ? 'text-primary font-medium' :
                                                currentStep === index + 1 ? 'text-primary font-medium' :
                                                    'text-muted-foreground'
                                        ) }
                                    >
                                        { label }
                                    </span>
                                )) }
                            </div>
                        </div>

                        <div className='min-h-[400px]'>
                            {/* Step 1: Personal Information */ }
                            { currentStep === 1 && (
                                <>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        <FormItem className='grid gap-3 col-span-2'>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    required
                                                    type='email'
                                                    placeholder='Enter your email address'
                                                    readOnly
                                                    value={ session?.user.email || '' }
                                                    disabled
                                                />
                                            </FormControl>
                                            <div className='min-h-[20px]'>
                                                <FormMessage />
                                            </div>
                                        </FormItem>

                                        <FormField
                                            control={ form.control }
                                            name='volunteerType'
                                            render={ ({ field }) => (
                                                <FormItem className='col-span-2'>
                                                    <FormLabel>Volunteer Type <span className='text-red-500'>*</span></FormLabel>
                                                    <Select 
                                                        onValueChange={ field.onChange } 
                                                        value={ field.value || '' }
                                                        defaultValue=''
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select your volunteer type (Required)' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value='TYPE_1_SEARCH_RESCUE'>
                                                                Type 1 - Search and Rescue Units (For Earthquake)
                                                            </SelectItem>
                                                            <SelectItem value='TYPE_2_EVACUATION_MOBILITY'>
                                                                Type 2 - Evacuation and Mobility Teams (For Lahar Flow)
                                                            </SelectItem>
                                                            <SelectItem value='TYPE_3_WASAR'>
                                                                Type 3 - Water Search and Rescue (WASAR) Teams (For Flooding)
                                                            </SelectItem>
                                                            <SelectItem value='TYPE_4_NOT_CERTIFIED'>
                                                                Type 4 - Not-Certified/Manpower
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            ) }
                                        />

                                        <FormField
                                            control={ form.control }
                                            name='firstName'
                                            render={ ({ field }) => (
                                                <FormItem className='grid gap-3'>
                                                    <FormLabel>First Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            required
                                                            placeholder='Enter your first name' { ...field }
                                                        />
                                                    </FormControl>
                                                    <div className='min-h-[20px]'>
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            ) }
                                        />

                                        <FormField
                                            control={ form.control }
                                            name='lastName'
                                            render={ ({ field }) => (
                                                <FormItem className='grid gap-3'>
                                                    <FormLabel>Last Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            required
                                                            placeholder='Enter your last name' { ...field }
                                                        />
                                                    </FormControl>
                                                    <div className='min-h-[20px]'>
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            ) }
                                        />

                                        <FormField
                                            control={ form.control }
                                            name='birthDate'
                                            rules={ { required: 'Birth date is required' } }
                                            render={ ({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date of Birth</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type='date'
                                                            max={ new Date().toISOString().split('T')[0] }
                                                            { ...field }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ) }
                                        />

                                        <FormField
                                            control={ form.control }
                                            name='phone'
                                            rules={ { required: 'Birth date is required' } }
                                            render={ ({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <PhoneInput
                                                            { ...field }
                                                            placeholder='09XX XXX XXXX'
                                                            defaultCountry='PH'
                                                            international={ false }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            ) }
                                        />
                                    </div>
                                </>
                            ) }

                            {/* Step 2: Address Information - Name and Email Disabled, Barangay Dropdown */}
                            { currentStep === 2 && (
                                <>
                                    {/* Name and Email - Disabled */}
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        <FormItem className='grid gap-3'>
                                            <FormLabel>First Name</FormLabel>
                                            <Input
                                                required
                                                placeholder='First name'
                                                disabled
                                                value={ form.watch('firstName') || '' }
                                            />
                                        </FormItem>

                                        <FormItem className='grid gap-3'>
                                            <FormLabel>Last Name</FormLabel>
                                            <Input
                                                required
                                                placeholder='Last name'
                                                disabled
                                                value={ form.watch('lastName') || '' }
                                            />
                                        </FormItem>
                                    </div>

                                    <FormItem className='grid gap-3'>
                                        <FormLabel>Email Address</FormLabel>
                                        <Input
                                            required
                                            type='email'
                                            placeholder='Email'
                                            readOnly
                                            disabled
                                            value={ session?.user.email || '' }
                                        />
                                    </FormItem>

                                    {/* Location Picker */}
                                    <div className='space-y-2'>
                                        <FormLabel>Select Your Location</FormLabel>
                                        <TarlacLocationPicker
                                            onLocationSelect={ (location) => {
                                                // Auto-fill the address fields
                                                form.setValue('barangay', location.barangay)
                                                form.setValue('city', 'Tarlac City')
                                                form.setValue('state', 'Tarlac')
                                                form.setValue('zipCode', '2300')
                                            } }
                                            onBarangayChange={ (barangay) => {
                                                // Update the barangay dropdown
                                                form.setValue('barangay', barangay)
                                            } }
                                            selectedBarangay={ form.watch('barangay') }
                                            title='Click on the map to select your exact location in Tarlac City'
                                            height='350px'
                                        />
                                    </div>

                                    {/* Barangay Dropdown */}
                                    <FormField
                                        control={ form.control }
                                        name='barangay'
                                        render={ ({ field }) => (
                                            <FormItem className='grid gap-3'>
                                                <FormLabel>Barangay</FormLabel>
                                                <Select onValueChange={ field.onChange } value={ field.value }>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select your barangay' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        { TARLAC_BARANGAYS.map((barangay) => (
                                                            <SelectItem key={ barangay } value={ barangay }>
                                                                { barangay }
                                                            </SelectItem>
                                                        )) }
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        ) }
                                    />

                                    {/* City, State, ZIP - Pre-filled and Disabled */}
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        <FormField
                                            control={ form.control }
                                            name='city'
                                            render={ ({ field }) => (
                                                <FormItem className='grid gap-3'>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl>
                                                        <Input required disabled placeholder='City' { ...field } />
                                                    </FormControl>
                                                    <div className='min-h-[20px]'>
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            ) }
                                        />

                                        <FormField
                                            control={ form.control }
                                            name='state'
                                            render={ ({ field }) => (
                                                <FormItem className='grid gap-3'>
                                                    <FormLabel>Province</FormLabel>
                                                    <FormControl>
                                                        <Input required disabled placeholder='Province' { ...field } />
                                                    </FormControl>
                                                    <div className='min-h-[20px]'>
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            ) }
                                        />
                                    </div>

                                    <FormField
                                        control={ form.control }
                                        name='zipCode'
                                        render={ ({ field }) => (
                                            <FormItem className='grid gap-3'>
                                                <FormLabel>ZIP/Postal Code</FormLabel>
                                                <FormControl>
                                                    <Input required placeholder='2300' { ...field } />
                                                </FormControl>
                                                <div className='min-h-[20px]'>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        ) }
                                    />
                                </>
                            ) }

                            {/* Step 3: Document Upload - Optional */}
                            { currentStep === 3 && (
                                <>
                                    <div className='text-center mb-6'>
                                        <p className='text-sm text-muted-foreground'>
                                            Upload your accreditation and certification documents in PDF format (max 10MB each).
                                            <br />
                                            <span className='font-medium text-foreground'>Optional - You can skip this step if you don't have documents yet.</span>
                                        </p>
                                    </div>

                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                        {/* Accreditation Document */ }
                                        <FormField
                                            control={ form.control }
                                            name='accreditationFile'
                                            render={ ({ field }) => (
                                                <FormItem className='grid gap-3'>
                                                    <FormLabel>Accreditation Document (Optional)</FormLabel>
                                                    <FormControl>
                                                        <FileInput
                                                            { ...field }
                                                            error={ !!form.formState.errors.accreditationFile }
                                                            disabled={ isSubmitting }
                                                        />
                                                    </FormControl>
                                                    <div className='min-h-[20px]'>
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            ) }
                                        />

                                        {/* Certification Document */ }
                                        <FormField
                                            control={ form.control }
                                            name='certificationFile'
                                            render={ ({ field }) => (
                                                <FormItem className='grid gap-3'>
                                                    <FormLabel>Certification Document (Optional)</FormLabel>
                                                    <FormControl>
                                                        <FileInput
                                                            { ...field }
                                                            error={ !!form.formState.errors.certificationFile }
                                                            disabled={ isSubmitting }
                                                        />
                                                    </FormControl>
                                                    <div className='min-h-[20px]'>
                                                        <FormMessage />
                                                    </div>
                                                </FormItem>
                                            ) }
                                        />
                                    </div>
                                </>
                            ) }
                        </div>

                        {/* Navigation Buttons - Fixed Layout */ }
                        <div className='flex justify-between items-center gap-4 mt-6'>
                            {/* Left side - Previous button or empty space */ }
                            <div className='flex-1'>
                                { currentStep > 1 && (
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={ handlePrevious }
                                        className='flex items-center justify-center space-x-2'
                                    >
                                        <ArrowLeft className='w-4 h-4' />
                                        <span>Previous</span>
                                    </Button>
                                ) }
                            </div>

                            {/* Right side - Continue/Submit button */ }
                            <div className='flex-1 flex justify-end'>
                                { currentStep < totalSteps ? (
                                    <Button
                                        type='button'
                                        onClick={ handleNext }
                                        className='flex items-center justify-center space-x-2'
                                    >
                                        <span>Continue</span>
                                        <ArrowRight className='w-4 h-4' />
                                    </Button>
                                ) : (
                                    <Button
                                        type='button'
                                        onClick={ async () => {
                                            // Only submit when actually clicking the button
                                            const valid = await form.trigger()
                                            if (valid) {
                                                form.handleSubmit(onSubmit)()
                                            }
                                        } }
                                        disabled={ isSubmitting }
                                        className='flex items-center justify-center space-x-2'
                                    >
                                        { isSubmitting ? (
                                            <>
                                                <div
                                                    className='w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin' />
                                                <span>Creating Account...</span>
                                            </>
                                        ) : (
                                            <span>Create Account</span>
                                        ) }
                                    </Button>
                                ) }
                            </div>
                            
                            {/* Skip Button for Step 3 */}
                            { currentStep === 3 && (
                                <div className='text-center mt-4'>
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        className='text-sm text-muted-foreground hover:text-foreground'
                                        onClick={ async () => {
                                            // Submit without documents
                                            const valid = await form.trigger()
                                            if (valid) {
                                                // Skip document upload and submit directly
                                                form.handleSubmit(onSubmit)()
                                            }
                                        } }
                                        disabled={ isSubmitting }
                                    >
                                        Skip and Create Account
                                    </Button>
                                </div>
                            ) }
                        </div>
                    </div>
                </div>
            </Form>

            <div className='text-muted-foreground text-center text-xs text-balance'>
                By creating an account, you agree to our{ ' ' }
                <a href='#' className='underline underline-offset-4 hover:text-primary'>
                    Terms of Service
                </a>{ ' ' }
                and{ ' ' }
                <a href='#' className='underline underline-offset-4 hover:text-primary'>
                    Privacy Policy
                </a>
                .
            </div>
        </div>
    )
}