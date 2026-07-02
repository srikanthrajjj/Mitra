import React from "react"

import { cn } from "@/lib/utils"

export interface OrbitingCirclesProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
  reverse?: boolean
  duration?: number
  delay?: number
  radius?: number
  path?: boolean
  iconSize?: number
  speed?: number
}

export function OrbitingCircles({
  className,
  children,
  reverse,
  duration = 20,
  radius = 160,
  path = true,
  iconSize = 30,
  speed = 1,
  ...props
}: OrbitingCirclesProps) {
  const calculatedDuration = duration / speed
  const childCount = React.Children.count(children)

  return (
    <div className="pointer-events-none absolute inset-0">
      {path && (
        <div
          className="eco-orbit-path absolute left-1/2 top-1/2 rounded-full border"
          style={{
            width: radius * 2,
            height: radius * 2,
            marginLeft: -radius,
            marginTop: -radius,
          }}
          aria-hidden
        />
      )}
      {React.Children.map(children, (child, index) => {
        const angle = (360 / childCount) * index
        return (
          <div
            key={index}
            className="absolute left-1/2 top-1/2 size-0"
            aria-hidden
          >
            <div
              style={
                {
                  "--duration": calculatedDuration,
                  "--radius": radius,
                  "--angle": angle,
                  "--icon-size": `${iconSize}px`,
                } as React.CSSProperties
              }
              className={cn(
                "animate-orbit flex size-0 items-center justify-center overflow-visible",
                { "[animation-direction:reverse]": reverse },
                className
              )}
              {...props}
            >
              {child}
            </div>
          </div>
        )
      })}
    </div>
  )
}
