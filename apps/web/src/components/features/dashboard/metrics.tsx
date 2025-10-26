import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { cn } from '@lib/utils'
import { TrendingDown, TrendingUp } from 'lucide-react'

export interface Metric {
    value: number
    change: number
    changeType: 'positive' | 'negative'
}

interface MetricsProps {
    title: string
    icon: React.ComponentType<{ className?: string }>
    iconColor?: string
    data: Metric
}


export const Metrics: React.FC<MetricsProps> = ({
    title,
    data: { change, value, changeType },
    icon: Icon,
    iconColor
}) => {
    const color = changeType === 'positive' ? 'text-green-500' : 'text-destructive'

    return (
        <Card className='border-none'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-card-foreground'>{ title }</CardTitle>
                <Icon className={ cn('h-5 w-5', iconColor ? iconColor : 'text-card-foreground') } />
            </CardHeader>
            <CardContent>
                <div className='text-2xl font-bold text-card-foreground'>{ value }</div>
                <div className='text-xs flex items-center mt-1'>
                    { changeType === 'positive' ? (
                        <TrendingUp className={ cn(color, 'h-4 w-4 mr-1') } />
                    ) : (
                        <TrendingDown className={ cn(color, 'h-4 w-4 mr-1') } />
                    ) }
                    <span className={ color }>
                        { change }%
                    </span>
                    <span className='text-muted-foreground ml-1'>from last month</span>
                </div>
            </CardContent>
        </Card>
    )
}