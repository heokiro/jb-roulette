import { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const RouletteContainer = styled.div`
  position: relative;
  width: 80vw;
  height: 80vw;
  min-width: 300px;
  min-height: 300px;
  max-width: min(60vh, 80vh);
  max-height: min(60vh, 80vh);
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  @media (max-width: 768px) {
    width: 80vw;
    height: 80vw;
    min-width: 250px;
    min-height: 250px;
  }
`

const Wheel = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 3vw rgba(0, 0, 0, 0.3);
  border: max(0.2vw, 4px) solid #fff;
  transition: transform ${props => props.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: rotate(${props => props.rotation}deg);
`

const CenterButton = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24%;
  height: 24%;
  min-width: 80px;
  min-height: 80px;
  border-radius: 50%;
  background-image: url(${props => props.showButtonImage ? '/images/Ellipse.png' : '/images/button.png'});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: ${props => props.showButtonImage ? 'white' : 'transparent'};
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.4vw 2vw rgba(0, 0, 0, 0.3);
  z-index: 5;
  transition: all 0.3s ease;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  
  &:hover:not(:disabled) {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 0.6vw 2.5vw rgba(0, 0, 0, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translate(-50%, -50%) scale(0.95);
  }
  
  &:disabled {
    opacity: 1;
  }
`

const CenterButtonImage = styled.img`
  width: 50%;
  height: 60%;
  object-fit: contain;
  transition: opacity 0.3s ease;
`

const Pointer = styled.img`
  position: absolute;
  top: -3vh;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  height: max(8vh, 50px);
  z-index: 10;
  filter: drop-shadow(0 0.2vw 0.4vw rgba(0, 0, 0, 0.3));
  pointer-events: none;
`

// Two gradient patterns
const gradient1 = 'linear-gradient(135deg, #4037D3 0%, #FB6211 100%)'
const gradient2 = 'linear-gradient(135deg, #FB6213 0%, #E22E59 100%)'

// Function to calculate angles while ensuring minimum angle
const calculateItemAngles = (availableItems, minAngle = 15) => {
  const totalQuantity = availableItems.reduce((sum, item) => sum + item.quantity, 0)
  const itemCount = availableItems.length

  // Total angle needed for minimum angles
  const minTotalAngle = itemCount * minAngle

  // Remaining angle (360 minus sum of minimum angles)
  const remainingAngle = Math.max(0, 360 - minTotalAngle)

  // Distribute remaining angle proportionally by quantity
  const angles = availableItems.map((item, index) => {
    // Base angle = minimum angle + (proportional remaining angle)
    const proportionalAngle = remainingAngle > 0
      ? (item.quantity / totalQuantity) * remainingAngle
      : 0
    const angle = minAngle + proportionalAngle

    return {
      item,
      angle,
      index
    }
  })

  // Adjust to ensure total is exactly 360 degrees
  const totalCalculatedAngle = angles.reduce((sum, { angle }) => sum + angle, 0)
  const scale = 360 / totalCalculatedAngle

  // Calculate start/end angles
  let currentAngle = 0
  const itemAngles = angles.map(({ item, angle, index }) => {
    const scaledAngle = angle * scale
    const startAngle = currentAngle
    const endAngle = currentAngle + scaledAngle
    currentAngle = endAngle

    // Alternate between 2 gradient patterns
    const gradient = index % 2 === 0 ? gradient1 : gradient2

    return {
      item,
      startAngle,
      endAngle,
      gradient
    }
  })

  return itemAngles
}

function Roulette({ items, onSpin, isSpinning, selectedItem, onSpinComplete, isWinnerModalOpen }) {
  const [currentRotation, setCurrentRotation] = useState(0)
  const [targetRotation, setTargetRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showButtonImage, setShowButtonImage] = useState(false)
  const popupTimerRef = useRef(null)
  const imageIntervalRef = useRef(null)
  const wasModalOpenRef = useRef(false)
  
  // Cycle images while roulette is spinning
  useEffect(() => {
    if (isAnimating) {
      const images = ['img1.png', 'img2.png', 'img3.png', 'img4.png']
      setCurrentImageIndex(0)
      setShowButtonImage(true)
      wasModalOpenRef.current = false

      // Change image every 0.2 seconds (cycle during 4-second animation)
      imageIntervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => {
          const nextIndex = (prev + 1) % images.length
          return nextIndex
        })
      }, 200)

      return () => {
        if (imageIntervalRef.current) {
          clearInterval(imageIntervalRef.current)
          imageIntervalRef.current = null
        }
      }
    } else {
      // Fix to last image (img4.png, index 3) after animation ends
      setCurrentImageIndex(3)
      if (imageIntervalRef.current) {
        clearInterval(imageIntervalRef.current)
        imageIntervalRef.current = null
      }
    }
  }, [isAnimating])
  
  // Track modal state and control image display
  useEffect(() => {
    if (isWinnerModalOpen) {
      // When modal opens
      wasModalOpenRef.current = true
      setShowButtonImage(true)
    } else if (wasModalOpenRef.current && !isAnimating) {
      // Return to button.png only when modal closed, was previously open, and animation ended
      setShowButtonImage(false)
      setCurrentImageIndex(0)
      wasModalOpenRef.current = false
    }
  }, [isWinnerModalOpen, isAnimating])
  
  // Function to calculate item at pointer position after rotation
  // Simple logic: find region at 12 o'clock pointer (270 degrees) after wheel stops
  const getItemAtPointer = (rotation, itemAngles) => {
    // Normalize rotation to 0~360 range
    let normalizedRotation = rotation % 360
    if (normalizedRotation < 0) normalizedRotation += 360

    // Pointer is fixed at 12 o'clock
    // Since SVG path uses (startAngle - 90), conic-gradient 0 degrees renders at 12 o'clock
    // Therefore pointer is at 0 degrees conic-gradient (360 equals 0)
    const pointerAngle = 0

    // Calculate actual position of each item after rotation
    for (const { item, startAngle, endAngle } of itemAngles) {
      // Calculate where item's start/end angles are after rotation
      // Angle increases as roulette rotates clockwise
      let rotatedStart = (startAngle + normalizedRotation) % 360
      if (rotatedStart < 0) rotatedStart += 360

      let rotatedEnd = (endAngle + normalizedRotation) % 360
      if (rotatedEnd < 0) rotatedEnd += 360

      // Check if pointer (0 degrees = 12 o'clock) is within item's rotated range
      if (rotatedStart < rotatedEnd) {
        // Normal case: start < end after rotation
        if (pointerAngle >= rotatedStart && pointerAngle < rotatedEnd) {
          return item
        }
      } else {
        // Crossing 360 boundary: start > end after rotation (e.g., 350 ~ 10 degrees)
        if (pointerAngle >= rotatedStart || pointerAngle < rotatedEnd) {
          return item
        }
      }
    }

    return null
  }

  // Filter only items with quantity > 0
  const availableItems = items.filter(item => item.quantity > 0)
  
  useEffect(() => {
    if (isSpinning && selectedItem && availableItems.length > 0) {
      // Calculate angles for each item (ensuring minimum angle)
      const itemAngles = calculateItemAngles(availableItems)

      // Find center angle of selected item
      const selectedAngleInfo = itemAngles.find(({ item }) => item.name === selectedItem.name)
      if (selectedAngleInfo) {
        // Center angle of selected item (conic-gradient: 0 degrees is right, 3 o'clock)
        const itemCenterAngle = (selectedAngleInfo.startAngle + selectedAngleInfo.endAngle) / 2

        // Simplest calculation:
        // Pointer fixed at 0 degrees (12 o'clock) in conic-gradient
        // Goal: (itemCenterAngle + finalRotation) % 360 = 0
        // finalRotation = (0 - itemCenterAngle) % 360 + n * 360 = (360 - itemCenterAngle) % 360 + n * 360

        // Current item position considering current rotation
        let currentItemPosition = itemCenterAngle + currentRotation
        while (currentItemPosition < 0) currentItemPosition += 360
        while (currentItemPosition >= 360) currentItemPosition -= 360

        // Calculate angle to reach 0 degrees (12 o'clock)
        let angleTo0 = 0 - currentItemPosition
        if (angleTo0 < 0) angleTo0 += 360
        if (angleTo0 === 0) angleTo0 = 360 // Add one more turn if already at 0 degrees

        // Multiple rotations (5-10 turns)
        const extraRotations = (5 + Math.random() * 5) * 360

        // Final rotation angle
        const finalRotation = currentRotation + angleTo0 + extraRotations

        // Verify: check if selected item is actually at pointer after rotation
        const finalItemAngles = itemAngles.map(({ item, startAngle, endAngle }) => ({
          item,
          startAngle,
          endAngle
        }))
        const itemAtPointer = getItemAtPointer(finalRotation, finalItemAngles)

        // Final position verification
        let finalPosition = itemCenterAngle + finalRotation
        while (finalPosition < 0) finalPosition += 360
        while (finalPosition >= 360) finalPosition -= 360

        // Simple log
        if (!itemAtPointer || itemAtPointer.name !== selectedItem.name) {
          console.warn('⚠️ Winner error:', {
            selected: selectedItem.name,
            pointer: itemAtPointer?.name || 'null',
            finalPosition: finalPosition.toFixed(2),
            expected: 270
          })
        }
        
        setTargetRotation(finalRotation)
        setIsAnimating(true)
      }
    }
  }, [isSpinning, selectedItem])

  useEffect(() => {
    if (isAnimating) {
      // Update current rotation value and stop after animation ends
      const timer = setTimeout(() => {
        setCurrentRotation(targetRotation)
        setIsAnimating(false)

        // Find prize at 12 o'clock pointer after wheel stops
        const availableItems = items.filter(item => item.quantity > 0)
        if (availableItems.length > 0) {
          // Calculate angles for each item (ensuring minimum angle)
          const itemAngles = calculateItemAngles(availableItems).map(({ item, startAngle, endAngle }) => ({
            item,
            startAngle,
            endAngle
          }))

          // Find prize at 12 o'clock pointer from actual stop position
          const winner = getItemAtPointer(targetRotation, itemAngles)

          // Debug: simple log
          const normalizedRotation = targetRotation % 360 < 0 ? (targetRotation % 360) + 360 : targetRotation % 360
          console.log('=== Winner Calculation ===')
          console.log('Rotation angle:', targetRotation.toFixed(2), 'Normalized:', normalizedRotation.toFixed(2))
          console.log('Pointer position: 270 degrees (12 o\'clock)')

          const debugInfo = itemAngles.map(({ item, startAngle, endAngle }) => {
            let rotatedStart = (startAngle + normalizedRotation) % 360
            if (rotatedStart < 0) rotatedStart += 360
            let rotatedEnd = (endAngle + normalizedRotation) % 360
            if (rotatedEnd < 0) rotatedEnd += 360

            let inRange = false
            const pointerAngle = 0 // 12 o'clock is 0 degrees in conic-gradient
            if (rotatedStart < rotatedEnd) {
              inRange = pointerAngle >= rotatedStart && pointerAngle < rotatedEnd
            } else {
              // Crossing 360 boundary (e.g., 350 ~ 10 degrees)
              inRange = pointerAngle >= rotatedStart || pointerAngle < rotatedEnd
            }

            return {
              name: item.name,
              rotatedRange: `${rotatedStart.toFixed(1)}° ~ ${rotatedEnd.toFixed(1)}°`,
              inRange: inRange ? '✓' : '✗'
            }
          })
          console.table(debugInfo)
          console.log('Winner:', winner ? winner.name : 'null')

          // Show popup 0.5 seconds after wheel completely stops
          if (winner && onSpinComplete) {
            popupTimerRef.current = setTimeout(() => {
              onSpinComplete(winner)
              popupTimerRef.current = null
            }, 500) // 0.5 second delay
          } else if (!winner) {
            console.error('Could not find winning prize!')
          }
        }
      }, 4000) // 4 second animation

      return () => {
        clearTimeout(timer)
        // Don't clear popup timer in cleanup (keep popup appearing after delay)
      }
    }
  }, [isAnimating, targetRotation, items, onSpinComplete])

  // Clean up popup timer and image interval on component unmount
  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current)
        popupTimerRef.current = null
      }
      if (imageIntervalRef.current) {
        clearInterval(imageIntervalRef.current)
        imageIntervalRef.current = null
      }
    }
  }, [])
  
  if (availableItems.length === 0) {
    return (
      <RouletteContainer>
        <Wheel
          gradientColors=""
          rotation={currentRotation}
          duration={0}
        >
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#666',
            fontSize: 'clamp(14px, 2vw, 20px)',
            textAlign: 'center'
          }}>
            Please add items
          </div>
        </Wheel>
        <CenterButton disabled />
        <Pointer src="/images/Polygon.png" alt="Pointer" />
      </RouletteContainer>
    )
  }

  // Calculate angles for each item (ensuring minimum angle)
  const itemAngles = calculateItemAngles(availableItems)

  // Determine rotation angle
  const rotation = isAnimating ? targetRotation : currentRotation

  // SVG path calculation function
  const createSectorPath = (startAngle, endAngle) => {
    const startRad = (startAngle - 90) * Math.PI / 180
    const endRad = (endAngle - 90) * Math.PI / 180
    const radius = 50
    
    const x1 = 50 + radius * Math.cos(startRad)
    const y1 = 50 + radius * Math.sin(startRad)
    const x2 = 50 + radius * Math.cos(endRad)
    const y2 = 50 + radius * Math.sin(endRad)
    
    const largeArc = (endAngle - startAngle) > 180 ? 1 : 0
    
    return `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  return (
    <RouletteContainer>
      <Wheel 
        rotation={rotation}
        duration={isAnimating ? 4 : 0}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            {itemAngles.map(({ gradient }, index) => {
              const gradientId = `gradient-${index}`
              const isGradient1 = index % 2 === 0
              const startColor = isGradient1 ? '#4037D3' : '#FB6213'
              const endColor = isGradient1 ? '#FB6211' : '#E22E59'
              
              // Calculate center angle of each sector
              const sectorAngle = itemAngles[index].endAngle - itemAngles[index].startAngle
              const centerAngle = itemAngles[index].startAngle + sectorAngle / 2
              const centerRad = (centerAngle - 90) * Math.PI / 180

              // Calculate gradient direction (135 degrees)
              const gradientAngle = centerAngle - 45
              const gradientRad = gradientAngle * Math.PI / 180

              // Calculate gradient start and end points
              const x1 = 50 + 50 * Math.cos(gradientRad)
              const y1 = 50 + 50 * Math.sin(gradientRad)
              const x2 = 50 - 50 * Math.cos(gradientRad)
              const y2 = 50 - 50 * Math.sin(gradientRad)
              
              return (
                <linearGradient key={gradientId} id={gradientId} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}>
                  <stop offset="0%" stopColor={startColor} />
                  <stop offset="100%" stopColor={endColor} />
                </linearGradient>
              )
            })}
          </defs>
          {itemAngles.map(({ item, startAngle, endAngle }, index) => {
            const gradientId = `gradient-${index}`
            const path = createSectorPath(startAngle, endAngle)
            
            // Calculate sector boundary (from center to edge of circle)
            const startRad = (startAngle - 90) * Math.PI / 180
            const endRad = (endAngle - 90) * Math.PI / 180
            const radius = 50
            const startX = 50 + radius * Math.cos(startRad)
            const startY = 50 + radius * Math.sin(startRad)
            const endX = 50 + radius * Math.cos(endRad)
            const endY = 50 + radius * Math.sin(endRad)

            // Calculate text position (about 30% from center of circle)
            const sectorAngle = endAngle - startAngle
            const centerAngle = startAngle + sectorAngle / 2
            const centerRad = (centerAngle - 90) * Math.PI / 180
            const textRadius = 30 // 30% from center
            const textX = 50 + textRadius * Math.cos(centerRad)
            const textY = 50 + textRadius * Math.sin(centerRad)

            // Text rotation angle: orient text toward center of circle
            // centerRad is angle of text position (0 degrees is top)
            // Rotate by centerRad + 180 degrees to orient text toward center
            const textRotation = (centerRad * 180 / Math.PI) + 180

            // Check if first or last item
            const isFirstItem = index === 0
            const isLastItem = index === itemAngles.length - 1

            return (
              <g key={index}>
                {/* Sector */}
                <path
                  d={path}
                  fill={`url(#${gradientId})`}
                />
                {/* Sector boundary (clean white line) */}
                <line
                  x1="50"
                  y1="50"
                  x2={startX}
                  y2={startY}
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                {isLastItem && (
                  <line
                    x1="50"
                    y1="50"
                    x2={endX}
                    y2={endY}
                    stroke="#ffffff"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                )}
                <text
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize="4.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                  style={{
                    textShadow: '0 0 2px rgba(0, 0, 0, 0.7)',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                >
                  {item.name}
                </text>
              </g>
            )
          })}
        </svg>
      </Wheel>
      <CenterButton 
        onClick={onSpin}
        disabled={isSpinning || isAnimating}
        showButtonImage={showButtonImage}
      >
        {showButtonImage && (
          <CenterButtonImage 
            src={`/images/${['img1.png', 'img2.png', 'img3.png', 'img4.png'][currentImageIndex]}`}
            alt=""
          />
        )}
      </CenterButton>
      <Pointer src="/images/Polygon.png" alt="Pointer" />
    </RouletteContainer>
  )
}

export default Roulette

