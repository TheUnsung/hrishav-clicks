"use client"

import React, { ElementType, forwardRef, useMemo, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref"

export interface VariableFontCursorProximityProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  as?: ElementType
  fromFontVariationSettings: string
  toFontVariationSettings: string
  containerRef: React.RefObject<HTMLElement | null>
  radius?: number
  falloff?: "linear" | "exponential" | "gaussian"
}

export const VariableFontCursorProximity = forwardRef<HTMLElement, VariableFontCursorProximityProps>(
  (
    {
      children,
      as = "span",
      fromFontVariationSettings,
      toFontVariationSettings,
      containerRef,
      radius = 50,
      falloff = "linear",
      className,
      ...props
    },
    ref
  ) => {
    const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
    const interpolatedSettingsRef = useRef<string[]>([])
    const mousePositionRef = useMousePositionRef(containerRef)
    const animFrameIdRef = useRef<number | null>(null)

    const parsedSettings = useMemo(() => {
      const parseAxes = (str: string) => {
        const map = new Map<string, number>()
        str
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => {
            const parts = s.split(" ").filter(Boolean)
            if (parts.length >= 2) {
              const name = parts[0].replace(/['"]/g, "")
              const val = parseFloat(parts[1])
              if (!isNaN(val)) map.set(name, val)
            }
          })
        return map
      }

      const fromSettings = parseAxes(fromFontVariationSettings)
      const toSettings = parseAxes(toFontVariationSettings)

      return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
        axis,
        fromValue,
        toValue: toSettings.get(axis) ?? fromValue,
      }))
    }, [fromFontVariationSettings, toFontVariationSettings])

    const calculateDistance = (
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ): number => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    }

    const calculateFalloff = (distance: number): number => {
      const normalizedDistance = Math.min(Math.max(1 - distance / radius, 0), 1)

      switch (falloff) {
        case "exponential":
          return Math.pow(normalizedDistance, 2)
        case "gaussian":
          return Math.exp(-Math.pow(distance / (radius / 2), 2) / 2)
        case "linear":
        default:
          return normalizedDistance
      }
    }

    useEffect(() => {
      let isMounted = true

      const updateFrame = () => {
        if (!isMounted) return

        if (containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect()

          letterRefs.current.forEach((letterRef, index) => {
            if (!letterRef) return

            const rect = letterRef.getBoundingClientRect()
            const letterCenterX = rect.left + rect.width / 2 - containerRect.left
            const letterCenterY = rect.top + rect.height / 2 - containerRect.top

            const distance = calculateDistance(
              mousePositionRef.current.x,
              mousePositionRef.current.y,
              letterCenterX,
              letterCenterY
            )

            if (distance >= radius) {
              if (letterRef.style.fontVariationSettings !== fromFontVariationSettings) {
                letterRef.style.fontVariationSettings = fromFontVariationSettings
              }
              return
            }

            const falloffValue = calculateFalloff(distance)

            const newSettings = parsedSettings
              .map(({ axis, fromValue, toValue }) => {
                const interpolatedValue =
                  fromValue + (toValue - fromValue) * falloffValue
                return `'${axis}' ${Math.round(interpolatedValue * 10) / 10}`
              })
              .join(", ")

            interpolatedSettingsRef.current[index] = newSettings
            letterRef.style.fontVariationSettings = newSettings
          })
        }

        animFrameIdRef.current = requestAnimationFrame(updateFrame)
      }

      animFrameIdRef.current = requestAnimationFrame(updateFrame)

      return () => {
        isMounted = false
        if (animFrameIdRef.current !== null) {
          cancelAnimationFrame(animFrameIdRef.current)
        }
      }
    }, [containerRef, radius, falloff, fromFontVariationSettings, parsedSettings, mousePositionRef])

    const words = String(children).split(" ")
    let letterIndex = 0
    const ElementTag = as as any

    return (
      <ElementTag
        ref={ref}
        className={cn(className)}
        {...props}
        data-text={children}
      >
        {words.map((word, wordIndex) => (
          <span
            key={wordIndex}
            className="inline-block whitespace-nowrap"
            aria-hidden
          >
            {word.split("").map((letter) => {
              const currentLetterIndex = letterIndex++
              return (
                <span
                  key={currentLetterIndex}
                  ref={(el) => {
                    letterRefs.current[currentLetterIndex] = el
                  }}
                  className="inline-block transition-[font-variation-settings] duration-75 ease-out"
                  aria-hidden="true"
                  style={{
                    fontVariationSettings:
                      interpolatedSettingsRef.current[currentLetterIndex] || fromFontVariationSettings,
                  }}
                >
                  {letter}
                </span>
              )
            })}
            {wordIndex < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        ))}
        <span className="sr-only">{children}</span>
      </ElementTag>
    )
  }
)

VariableFontCursorProximity.displayName = "VariableFontCursorProximity"
export default VariableFontCursorProximity
