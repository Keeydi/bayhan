'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@components/ui/chart'
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import React from 'react'

export interface TrendsProps {
    registration: Array<{
        month: string
        users: number
        volunteers: number
    }>
    incidents: Array<{
        month: string
        reports: number
    }>
}

export const Trends: React.FC<TrendsProps> = ({ registration, incidents }) => {
    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <Card className='border-none'>
                <CardHeader>
                    <CardTitle className='text-card-foreground'>User Registration Trends</CardTitle>
                    <CardDescription>Monthly user and volunteer registrations</CardDescription>
                </CardHeader>
                <CardContent className='p-0 sm:p-6'>
                    <ChartContainer
                        config={ {
                            users: { label: 'Total Users', color: 'hsl(var(--chart-1))' },
                            volunteers: { label: 'Volunteers', color: 'hsl(var(--chart-2))' }
                        } }
                        className='h-[250px] sm:h-[300px] w-full'
                    >
                        <ResponsiveContainer width='100%' height='100%' minHeight={ 200 }>
                            <BarChart
                                data={ registration }
                                margin={ { top: 10, right: 10, left: 0, bottom: 0 } }
                            >
                                <CartesianGrid vertical={ false } />
                                <XAxis
                                    dataKey='month'
                                    stroke='hsl(var(--primary))'
                                    fontSize={ 12 }
                                    tickLine={ false }
                                    axisLine={ false }
                                />
                                <YAxis
                                    stroke='hsl(var(--primary))'
                                    fontSize={ 12 }
                                    tickLine={ false }
                                    axisLine={ false }
                                    width={ 30 }
                                    tickFormatter={ (value: number) => Math.round(value).toString() }
                                />
                                <ChartTooltip content={ <ChartTooltipContent /> } />
                                <Bar
                                    dataKey='users'
                                    fill='var(--primary)'
                                    name='Total Users'
                                    radius={ [ 2, 2, 0, 0 ] }
                                    isAnimationActive
                                    animationDuration={ 800 }
                                />
                                <Bar
                                    dataKey='volunteers'
                                    fill='var(--primary)'
                                    name='Volunteers'
                                    radius={ [ 2, 2, 0, 0 ] }
                                    isAnimationActive
                                    animationDuration={ 800 }
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>


            <Card className='border-none'>
                <CardHeader>
                    <CardTitle className='text-card-foreground'>Incident Reports Overview</CardTitle>
                    <CardDescription>Monthly incident reports</CardDescription>
                </CardHeader>
                <CardContent className='p-0 sm:p-6'>
                    <ChartContainer
                        config={ { reports: { label: 'Reports', color: 'hsl(var(--chart-4))' } } }
                        className='h-[250px] sm:h-[300px] w-full'
                    >
                        <ResponsiveContainer width='100%' height='100%' minHeight={ 200 }>
                            <LineChart
                                accessibilityLayer
                                data={ incidents }
                                margin={ { top: 20, left: 0, right: 10, bottom: 0 } }
                            >
                                <CartesianGrid vertical={ false } />
                                <XAxis
                                    dataKey='month'
                                    tickLine={ false }
                                    axisLine={ false }
                                    tickMargin={ 8 }
                                    fontSize={ 12 }
                                    tickFormatter={ (value) => value.slice(0, 3) }
                                />
                                <YAxis
                                    tickLine={ false }
                                    axisLine={ false }
                                    fontSize={ 12 }
                                    width={ 30 }
                                    tickFormatter={ (value: number) => Math.round(value).toString() }
                                />
                                <ChartTooltip
                                    cursor={ false }
                                    content={ <ChartTooltipContent indicator='line' /> }
                                />
                                <Line
                                    dataKey='reports'
                                    type='natural'
                                    stroke='var(--primary)'
                                    strokeWidth={ 2 }
                                    dot={ { fill: 'var(--primary)', r: 3 } }
                                    activeDot={ { r: 5 } }
                                    isAnimationActive
                                    animationDuration={ 1000 }
                                >
                                    <LabelList
                                        position='top'
                                        offset={ 12 }
                                        className='fill-foreground'
                                        fontSize={ 10 }
                                        formatter={ (value: number) => Math.round(value).toString() }
                                    />
                                </Line>
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}