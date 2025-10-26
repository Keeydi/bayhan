'use client'

import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { Building, Loader2, MapPin, Navigation, Search, Store } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'

interface LocationPrediction {
    place_id: string
    description: string
    structured_formatting: {
        main_text: string
        secondary_text: string
    }
    types: string[]
}

interface LocationSearchProps {
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
    initialValue?: string
    placeholder?: string
}

export const LocationSearch = ({
    onLocationSelect,
    initialValue = '',
    placeholder = 'Search for a location...'
}: LocationSearchProps) => {
    const map = useMap()
    const places = useMapsLibrary('places')
    const [ searchValue, setSearchValue ] = useState(initialValue)
    const [ predictions, setPredictions ] = useState<LocationPrediction[]>([])
    const [ isLoading, setIsLoading ] = useState(false)
    const [ isOpen, setIsOpen ] = useState(false)
    const [ highlightedIndex, setHighlightedIndex ] = useState(-1)

    // Use debounce hook instead of manual timeout
    const debouncedSearchValue = useDebounce(searchValue, 300)

    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
    const placesService = useRef<google.maps.places.PlacesService | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Initialize services when places library is ready
    useEffect(() => {
        if (!places) return

        autocompleteService.current = new places.AutocompleteService()

        if (!map) return

        placesService.current = new places.PlacesService(map as any)

    }, [ places, map ])

    // Reset highlighted index when predictions change
    useEffect(() => {
        setHighlightedIndex(-1)
    }, [ predictions ])

    // Search function
    const searchPlaces = useCallback(async (input: string) => {
        if (!autocompleteService.current || !input.trim()) {
            setPredictions([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        await autocompleteService.current.getPlacePredictions(
            {
                input: input.trim(),
                types: [ 'establishment', 'geocode' ],
                componentRestrictions: { country: 'ph' }
            },
            (predictions, status) => {
                setIsLoading(false)
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setPredictions(predictions)
                } else {
                    setPredictions([])
                }
            }
        )
    }, [])

    // Effect to handle debounced search
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchValue.trim()) {
                await searchPlaces(debouncedSearchValue)
            } else {
                setPredictions([])
                setIsLoading(false)
            }
        }

        performSearch().then()
    }, [ debouncedSearchValue, searchPlaces ])

    // Handle input change - simplified without debouncing logic
    const handleInputChange = useCallback((value: string) => {
        setSearchValue(value)

        if (value.trim()) {
            setIsOpen(true)
            return
        }

        setPredictions([])
        setIsLoading(false)
    }, [])

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isOpen || predictions.length === 0) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setHighlightedIndex(prev =>
                    prev < predictions.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : predictions.length - 1
                )
                break
            case 'Enter':
                e.preventDefault()
                if (highlightedIndex >= 0 && predictions[highlightedIndex]) {
                    const prediction = predictions[highlightedIndex]
                    handlePlaceSelect(prediction.place_id, prediction.description)
                }
                break
            case 'Escape':
                e.preventDefault()
                setIsOpen(false)
                inputRef.current?.blur()
                break
        }
    }, [ isOpen, predictions, highlightedIndex ])

    // Handle place selection
    const handlePlaceSelect = useCallback((placeId: string, description: string) => {
        if (!placesService.current) return

        placesService.current.getDetails(
            {
                placeId,
                fields: [ 'geometry', 'formatted_address', 'name' ]
            },
            (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                    const lat = place.geometry.location.lat()
                    const lng = place.geometry.location.lng()
                    const address = place.formatted_address || place.name || description

                    onLocationSelect({ lat, lng, address })
                    setSearchValue(address)
                    setIsOpen(false)
                    setPredictions([])

                    // Center map on selected location
                    if (map) {
                        map.panTo({ lat, lng })
                        map.setZoom(15)
                    }
                }
            }
        )
    }, [ map, onLocationSelect ])

    // Get current location
    const handleGetCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) return

        setIsLoading(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude

                const geocoder = new google.maps.Geocoder()
                await geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    setIsLoading(false)
                    if (status === 'OK' && results?.[0]) {
                        const address = results[0].formatted_address
                        onLocationSelect({ lat, lng, address })
                        setSearchValue(address)
                        setIsOpen(false)

                        if (map) {
                            map.panTo({ lat, lng })
                            map.setZoom(15)
                        }
                    }
                })
            },
            (error) => {
                setIsLoading(false)
                console.error('Error getting current location:', error)
            }
        )
    }, [ map, onLocationSelect ])

    const getPlaceTypeIcon = (types: string[]) => {
        if (types.includes('restaurant') || types.includes('food')) return Store
        if (types.includes('hospital') || types.includes('health')) return Building
        if (types.includes('school') || types.includes('university')) return Building
        if (types.includes('shopping_mall') || types.includes('store')) return Store
        if (types.includes('gas_station')) return Building
        if (types.includes('bank')) return Building
        return MapPin
    }

    const formatPlaceType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    return (
        <div className='relative w-full'>
            <Popover open={ isOpen } onOpenChange={ setIsOpen } modal>
                <PopoverTrigger asChild>
                    <div className='relative w-full'>
                        <Search
                            className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10' />
                        <Input
                            ref={ inputRef }
                            placeholder={ placeholder }
                            value={ searchValue }
                            onChange={ (e) => handleInputChange(e.target.value) }
                            onKeyDown={ handleKeyDown }
                            onFocus={ () => {
                                if (searchValue.trim()) {
                                    setIsOpen(true)
                                }
                            } }
                            className='pl-10 pr-12 w-full'
                        />
                        <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0'
                            onClick={ handleGetCurrentLocation }
                            disabled={ isLoading }
                            title='Use current location'
                        >
                            { isLoading ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                                <Navigation className='h-4 w-4' />
                            ) }
                        </Button>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className='p-0'
                    align='start'
                    side='bottom'
                    style={ { width: inputRef.current?.offsetWidth || 'auto' } }
                    onOpenAutoFocus={ (e) => e.preventDefault() }
                >
                    <div className='max-h-64 overflow-y-auto'>
                        { isLoading && predictions.length === 0 && (
                            <div className='flex items-center gap-2 p-3 text-sm text-muted-foreground'>
                                <Loader2 className='h-4 w-4 animate-spin' />
                                Searching locations...
                            </div>
                        ) }

                        { predictions.length > 0 && (
                            <div className='py-1'>
                                { predictions.map((prediction, index) => {
                                    const IconComponent = getPlaceTypeIcon(prediction.types)
                                    const isHighlighted = index === highlightedIndex
                                    return (
                                        <button
                                            key={ prediction.place_id }
                                            className={ `w-full text-left px-3 py-2 transition-colors ${
                                                isHighlighted
                                                    ? 'bg-accent text-accent-foreground'
                                                    : 'hover:bg-accent hover:text-accent-foreground'
                                            }` }
                                            onClick={ () => handlePlaceSelect(prediction.place_id, prediction.description) }
                                            onMouseEnter={ () => setHighlightedIndex(index) }
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='flex-shrink-0'>
                                                    <div
                                                        className='w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center'>
                                                        <IconComponent className='h-3.5 w-3.5 text-primary' />
                                                    </div>
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <div className='font-medium text-sm truncate'>
                                                        { prediction.structured_formatting.main_text }
                                                    </div>
                                                    <div className='text-xs text-muted-foreground truncate'>
                                                        { prediction.structured_formatting.secondary_text }
                                                    </div>
                                                </div>
                                                { prediction.types.length > 0 && (
                                                    <div className='flex-shrink-0'>
                                                        <Badge
                                                            variant='secondary'
                                                            className='text-xs px-1.5 py-0.5 font-normal h-5'
                                                        >
                                                            { formatPlaceType(prediction.types[0] || '') }
                                                        </Badge>
                                                    </div>
                                                ) }
                                            </div>
                                        </button>
                                    )
                                }) }
                            </div>
                        ) }

                        { searchValue.trim() && predictions.length === 0 && !isLoading && (
                            <div className='p-4 text-center'>
                                <div
                                    className='w-10 h-10 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-2'>
                                    <Search className='h-4 w-4 text-muted-foreground' />
                                </div>
                                <p className='text-sm font-medium'>No locations found</p>
                                <p className='text-xs text-muted-foreground mt-1'>
                                    Try adjusting your search terms
                                </p>
                            </div>
                        ) }
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
