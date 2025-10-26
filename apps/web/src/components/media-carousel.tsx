'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Carousel, CarouselContent, CarouselItem } from '@components/ui/carousel'
import { Image, X } from 'lucide-react'
import { cn } from '@lib/utils'

interface MediaItem {
    id: string
    url: string
}

interface MediaCarouselProps {
    title: string
    description: string
    photos: MediaItem[]
    className?: string
}

export function MediaCarousel({ title, description, photos, className }: MediaCarouselProps) {
    const [ selectedPhoto, setSelectedPhoto ] = useState<string | null>(null)
    const [ currentSlide, setCurrentSlide ] = useState(0)
    const [ carouselApi, setCarouselApi ] = useState<any>(null)

    // Handle carousel API and slide tracking
    const onCarouselSelect = useCallback(() => {
        if (!carouselApi) return
        setCurrentSlide(carouselApi.selectedScrollSnap())
    }, [ carouselApi ])

    useEffect(() => {
        if (!carouselApi) return

        onCarouselSelect()
        carouselApi.on('select', onCarouselSelect)

        return () => carouselApi.off('select', onCarouselSelect)
    }, [ carouselApi, onCarouselSelect ])

    const scrollToSlide = (index: number) => {
        if (!carouselApi) return
        carouselApi.scrollTo(index)
    }

    return (
        <>
            <Card className={ cn('border-none', className) }>
                <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                        <span>{ title }</span>
                        <Badge variant='outline' className='text-xs'>
                            { photos.length } image{ photos.length !== 1 ? 's' : '' }
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        { description }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    { photos.length > 0 ? (
                        <div className='relative'>
                            <Carousel
                                setApi={ setCarouselApi }
                                opts={ {
                                    align: 'center',
                                    loop: true,
                                    containScroll: 'trimSnaps',
                                    dragFree: false,
                                    skipSnaps: false
                                } }
                                className='w-full'
                            >
                                <CarouselContent className='-ml-2 md:-ml-4'>
                                    { photos.map((media, idx) => (
                                        <CarouselItem
                                            key={ media.id }
                                            className='pl-2 md:pl-4 basis-4/5 sm:basis-3/5 md:basis-1/2'
                                        >
                                            <div
                                                className='group relative overflow-hidden rounded-lg border cursor-pointer transition-all hover:shadow-lg active:scale-95 sm:active:scale-100'
                                                onClick={ () => setSelectedPhoto(media.url) }
                                            >
                                                <div className='aspect-video relative'>
                                                    <img
                                                        src={ media.url }
                                                        alt={ `Media ${ idx + 1 }` }
                                                        className='w-full h-full object-cover transition-transform group-hover:scale-105'
                                                        loading='lazy'
                                                    />
                                                    <div
                                                        className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors' />
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    )) }
                                </CarouselContent>
                            </Carousel>

                            <div className='flex justify-center mt-4 gap-1 sm:hidden'>
                                { photos.map((_, idx) => (
                                    <button
                                        key={ idx }
                                        type='button'
                                        onClick={ () => scrollToSlide(idx) }
                                        className={ cn(
                                            'w-2 h-2 rounded-full transition-all duration-300 transform',
                                            currentSlide === idx ? 'bg-muted-foreground/80' : 'bg-muted-foreground/30'
                                        ) }
                                        aria-label={ `Go to slide ${ idx + 1 }` }
                                    />
                                )) }
                            </div>

                            <div className='text-center mt-3 sm:hidden'>
                                <p className='text-xs text-muted-foreground'>
                                    ← Swipe to see more →
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className='text-center py-6 sm:py-8 text-muted-foreground'>
                            <Image className='h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50' />
                            <p className='text-sm sm:text-base'>No media files available yet</p>
                        </div>
                    ) }
                </CardContent>
            </Card>

            { selectedPhoto && (
                <div
                    className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4'
                    onClick={ () => setSelectedPhoto(null) }
                >
                    <div className='relative max-w-4xl max-h-full w-full'>
                        <img
                            src={ selectedPhoto }
                            alt='Media'
                            className='max-w-full max-h-full object-contain rounded-lg mx-auto'
                        />
                        <Button
                            variant='ghost'
                            size='sm'
                            className='absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white'
                            onClick={ (e) => {
                                e.stopPropagation()
                                setSelectedPhoto(null)
                            } }
                        >
                            <X className='h-4 w-4' />
                        </Button>
                    </div>
                </div>
            ) }
        </>
    )
}
