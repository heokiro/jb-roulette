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

// 두 가지 그라데이션 패턴
const gradient1 = 'linear-gradient(135deg, #4037D3 0%, #FB6211 100%)'
const gradient2 = 'linear-gradient(135deg, #FB6213 0%, #E22E59 100%)'

function Roulette({ items, onSpin, isSpinning, selectedItem, onSpinComplete, isWinnerModalOpen }) {
  const [currentRotation, setCurrentRotation] = useState(0)
  const [targetRotation, setTargetRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showButtonImage, setShowButtonImage] = useState(false)
  const popupTimerRef = useRef(null)
  const imageIntervalRef = useRef(null)
  const wasModalOpenRef = useRef(false)
  
  // 룰렛이 돌아가는 동안 이미지 순환
  useEffect(() => {
    if (isAnimating) {
      const images = ['img1.png', 'img2.png', 'img3.png', 'img4.png']
      setCurrentImageIndex(0)
      setShowButtonImage(true)
      wasModalOpenRef.current = false
      
      // 0.2초마다 이미지 변경 (4초 애니메이션 동안 순환)
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
      // 애니메이션이 끝나면 마지막 이미지(img4.png, 인덱스 3)로 고정
      setCurrentImageIndex(3)
      if (imageIntervalRef.current) {
        clearInterval(imageIntervalRef.current)
        imageIntervalRef.current = null
      }
    }
  }, [isAnimating])
  
  // 모달 상태 추적 및 이미지 표시 제어
  useEffect(() => {
    if (isWinnerModalOpen) {
      // 모달이 열렸을 때
      wasModalOpenRef.current = true
      setShowButtonImage(true)
    } else if (wasModalOpenRef.current && !isAnimating) {
      // 모달이 닫혔고, 이전에 모달이 열려있었고, 애니메이션이 끝났을 때만 button.png로 복귀
      setShowButtonImage(false)
      setCurrentImageIndex(0)
      wasModalOpenRef.current = false
    }
  }, [isWinnerModalOpen, isAnimating])
  
  // 회전 후 최종 위치에서 포인터가 가리키는 아이템을 계산하는 함수
  // 가장 간단한 로직: 룰렛이 멈춘 후 12시 포인터(270도)가 가리키는 영역 찾기
  const getItemAtPointer = (rotation, itemAngles) => {
    // rotation을 0~360 범위로 정규화
    let normalizedRotation = rotation % 360
    if (normalizedRotation < 0) normalizedRotation += 360
    
    // 포인터는 12시에 고정
    // SVG path에서 (startAngle - 90)을 사용하므로, conic-gradient 0도가 12시에 렌더링됨
    // 따라서 포인터는 conic-gradient 기준 0도 (360도는 0도와 같음)
    const pointerAngle = 0
    
    // 각 아이템의 회전 후 실제 위치 계산
    for (const { item, startAngle, endAngle } of itemAngles) {
      // 아이템의 시작/끝 각도가 회전 후 어디에 있는지 계산
      // 룰렛이 시계방향으로 회전하므로 각도가 증가
      let rotatedStart = (startAngle + normalizedRotation) % 360
      if (rotatedStart < 0) rotatedStart += 360
      
      let rotatedEnd = (endAngle + normalizedRotation) % 360
      if (rotatedEnd < 0) rotatedEnd += 360
      
      // 포인터(0도 = 12시)가 이 아이템의 회전 후 범위에 있는지 확인
      if (rotatedStart < rotatedEnd) {
        // 일반적인 경우: 회전 후에도 start < end
        if (pointerAngle >= rotatedStart && pointerAngle < rotatedEnd) {
          return item
        }
      } else {
        // 360도 경계를 넘어가는 경우: 회전 후 start > end (예: 350도 ~ 10도)
        if (pointerAngle >= rotatedStart || pointerAngle < rotatedEnd) {
          return item
        }
      }
    }
    
    return null
  }

  // 수량이 0보다 큰 상품만 필터링
  const availableItems = items.filter(item => item.quantity > 0)
  
  useEffect(() => {
    if (isSpinning && selectedItem && availableItems.length > 0) {
      // 각 상품의 각도 계산
      const totalQuantity = availableItems.reduce((sum, item) => sum + item.quantity, 0)
      let currentAngle = 0
      
      const itemAngles = availableItems.map((item, index) => {
        const angle = (item.quantity / totalQuantity) * 360
        const startAngle = currentAngle
        const endAngle = currentAngle + angle
        currentAngle = endAngle
        
        // 2가지 그라데이션 패턴 반복
        const gradient = index % 2 === 0 ? gradient1 : gradient2
        
        return {
          item,
          startAngle,
          endAngle,
          gradient
        }
      })

      // 선택된 아이템의 중간 각도 찾기
      const selectedAngleInfo = itemAngles.find(({ item }) => item.name === selectedItem.name)
      if (selectedAngleInfo) {
        // 선택된 아이템의 중간 각도 (conic-gradient 기준: 0도는 오른쪽, 3시)
        const itemCenterAngle = (selectedAngleInfo.startAngle + selectedAngleInfo.endAngle) / 2
        
        // 가장 간단한 계산:
        // 포인터는 0도(12시)에 고정 (conic-gradient 기준)
        // 목표: (itemCenterAngle + finalRotation) % 360 = 0
        // finalRotation = (0 - itemCenterAngle) % 360 + n * 360 = (360 - itemCenterAngle) % 360 + n * 360
        
        // 현재 회전을 고려한 현재 아이템 위치
        let currentItemPosition = itemCenterAngle + currentRotation
        while (currentItemPosition < 0) currentItemPosition += 360
        while (currentItemPosition >= 360) currentItemPosition -= 360
        
        // 0도(12시)까지 가는 각도 계산
        let angleTo0 = 0 - currentItemPosition
        if (angleTo0 < 0) angleTo0 += 360
        if (angleTo0 === 0) angleTo0 = 360 // 이미 0도에 있으면 한 바퀴 더
        
        // 여러 바퀴 회전 (5-10바퀴)
        const extraRotations = (5 + Math.random() * 5) * 360
        
        // 최종 회전 각도
        const finalRotation = currentRotation + angleTo0 + extraRotations
        
        // 검증: 회전 후 실제로 선택된 아이템이 포인터에 있는지 확인
        const finalItemAngles = itemAngles.map(({ item, startAngle, endAngle }) => ({
          item,
          startAngle,
          endAngle
        }))
        const itemAtPointer = getItemAtPointer(finalRotation, finalItemAngles)
        
        // 최종 위치 검증
        let finalPosition = itemCenterAngle + finalRotation
        while (finalPosition < 0) finalPosition += 360
        while (finalPosition >= 360) finalPosition -= 360
        
        // 간단한 로그
        if (!itemAtPointer || itemAtPointer.name !== selectedItem.name) {
          console.warn('⚠️ 당첨 오류:', {
            선택: selectedItem.name,
            포인터: itemAtPointer?.name || 'null',
            최종위치: finalPosition.toFixed(2),
            예상: 270
          })
        }
        
        setTargetRotation(finalRotation)
        setIsAnimating(true)
      }
    }
  }, [isSpinning, selectedItem])

  useEffect(() => {
    if (isAnimating) {
      // 애니메이션이 끝나면 현재 회전값을 업데이트하고 멈춤
      const timer = setTimeout(() => {
        setCurrentRotation(targetRotation)
        setIsAnimating(false)
        
        // 룰렛이 멈춘 후 실제 12시 포인터가 가리키는 경품 찾기
        const availableItems = items.filter(item => item.quantity > 0)
        if (availableItems.length > 0) {
          const totalQuantity = availableItems.reduce((sum, item) => sum + item.quantity, 0)
          let currentAngle = 0
          
          const itemAngles = availableItems.map((item) => {
            const angle = (item.quantity / totalQuantity) * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + angle
            currentAngle = endAngle
            return { item, startAngle, endAngle }
          })
          
          // 실제 멈춘 위치에서 12시 포인터가 가리키는 경품 찾기
          const winner = getItemAtPointer(targetRotation, itemAngles)
          
          // 디버깅: 간단한 로그
          const normalizedRotation = targetRotation % 360 < 0 ? (targetRotation % 360) + 360 : targetRotation % 360
          console.log('=== 당첨 경품 계산 ===')
          console.log('회전 각도:', targetRotation.toFixed(2), '정규화:', normalizedRotation.toFixed(2))
          console.log('포인터 위치: 270도 (12시)')
          
          const debugInfo = itemAngles.map(({ item, startAngle, endAngle }) => {
            let rotatedStart = (startAngle + normalizedRotation) % 360
            if (rotatedStart < 0) rotatedStart += 360
            let rotatedEnd = (endAngle + normalizedRotation) % 360
            if (rotatedEnd < 0) rotatedEnd += 360
            
            let inRange = false
            const pointerAngle = 0 // 12시는 conic-gradient 기준 0도
            if (rotatedStart < rotatedEnd) {
              inRange = pointerAngle >= rotatedStart && pointerAngle < rotatedEnd
            } else {
              // 360도 경계를 넘어가는 경우 (예: 350도 ~ 10도)
              inRange = pointerAngle >= rotatedStart || pointerAngle < rotatedEnd
            }
            
            return {
              이름: item.name,
              회전후범위: `${rotatedStart.toFixed(1)}° ~ ${rotatedEnd.toFixed(1)}°`,
              범위내: inRange ? '✓' : '✗'
            }
          })
          console.table(debugInfo)
          console.log('당첨 경품:', winner ? winner.name : 'null')
          
          // 룰렛이 완전히 멈춘 후 0.5초 뒤에 팝업 표시
          if (winner && onSpinComplete) {
            popupTimerRef.current = setTimeout(() => {
              onSpinComplete(winner)
              popupTimerRef.current = null
            }, 500) // 0.5초 지연
          } else if (!winner) {
            console.error('당첨 경품을 찾을 수 없습니다!')
          }
        }
      }, 4000) // 4초 애니메이션
      
      return () => {
        clearTimeout(timer)
        // 팝업 타이머는 cleanup에서 클리어하지 않음 (1초 후 팝업이 뜨도록 유지)
      }
    }
  }, [isAnimating, targetRotation, items, onSpinComplete])

  // 컴포넌트 언마운트 시 팝업 타이머 및 이미지 인터벌 정리
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
            상품을 추가해주세요
          </div>
        </Wheel>
        <CenterButton disabled />
        <Pointer src="/images/Polygon.png" alt="포인터" />
      </RouletteContainer>
    )
  }

  // 각 상품의 각도 계산
  const totalQuantity = availableItems.reduce((sum, item) => sum + item.quantity, 0)
  let currentAngle = 0
  
  // 각 상품의 시작/끝 각도와 색상 정보 저장
  const itemAngles = availableItems.map((item, index) => {
    const angle = (item.quantity / totalQuantity) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle
    
    // 2가지 그라데이션 패턴 반복
    const gradient = index % 2 === 0 ? gradient1 : gradient2
    
    return {
      item,
      startAngle,
      endAngle,
      gradient
    }
  })

  // 회전 각도 결정
  const rotation = isAnimating ? targetRotation : currentRotation

  // SVG path 계산 함수
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
            {/* 경계선 그림자 효과 필터 */}
            <filter id="borderShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.2"/>
              <feOffset dx="0.8" dy="0.8" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.4"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="offsetblur"/>
              </feMerge>
            </filter>
            {/* 경계선 반대 방향 그림자 효과 필터 (첫 번째 상품의 시작 경계선용) */}
            <filter id="borderShadowReverse" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.2"/>
              <feOffset dx="-0.8" dy="-0.8" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.4"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="offsetblur"/>
              </feMerge>
            </filter>
            {/* 상품1에서 상품N 쪽으로 향하는 특별한 그림자 효과 필터 */}
            <filter id="borderShadowToLast" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.2"/>
              <feOffset dx="-0.8" dy="0" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.4"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="offsetblur"/>
              </feMerge>
            </filter>
            {/* 구역 입체감 그림자 효과 (한쪽에 그림자) */}
            <filter id="sectorShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
              <feOffset dx="0.1" dy="0.1" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="offsetblur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {itemAngles.map(({ gradient }, index) => {
              const gradientId = `gradient-${index}`
              const isGradient1 = index % 2 === 0
              const startColor = isGradient1 ? '#4037D3' : '#FB6213'
              const endColor = isGradient1 ? '#FB6211' : '#E22E59'
              
              // 각 구역의 중앙 각도 계산
              const sectorAngle = itemAngles[index].endAngle - itemAngles[index].startAngle
              const centerAngle = itemAngles[index].startAngle + sectorAngle / 2
              const centerRad = (centerAngle - 90) * Math.PI / 180
              
              // 그라데이션 방향 계산 (135도 방향)
              const gradientAngle = centerAngle - 45
              const gradientRad = gradientAngle * Math.PI / 180
              
              // 그라데이션의 시작점과 끝점 계산
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
            
            // 구역 경계선 계산 (원의 중심에서 가장자리까지)
            const startRad = (startAngle - 90) * Math.PI / 180
            const endRad = (endAngle - 90) * Math.PI / 180
            const radius = 50
            const startX = 50 + radius * Math.cos(startRad)
            const startY = 50 + radius * Math.sin(startRad)
            const endX = 50 + radius * Math.cos(endRad)
            const endY = 50 + radius * Math.sin(endRad)
            
            // 텍스트 위치 계산 (원의 중심에서 약 30% 떨어진 곳)
            const sectorAngle = endAngle - startAngle
            const centerAngle = startAngle + sectorAngle / 2
            const centerRad = (centerAngle - 90) * Math.PI / 180
            const textRadius = 30 // 원의 중심에서 30% 떨어진 위치
            const textX = 50 + textRadius * Math.cos(centerRad)
            const textY = 50 + textRadius * Math.sin(centerRad)
            
            // 텍스트 회전 각도: 텍스트가 원의 중심을 향하도록
            // centerRad는 텍스트 위치의 각도 (0도가 위쪽)
            // 텍스트가 원의 중심을 향하려면 centerRad + 180도로 회전
            const textRotation = (centerRad * 180 / Math.PI) + 180
            
            // 첫 번째 상품과 마지막 상품 확인
            const isFirstItem = index === 0
            const isLastItem = index === itemAngles.length - 1
            
            return (
              <g key={index}>
                {/* 구역에 입체감 그림자 효과 */}
                <path
                  d={path}
                  fill={`url(#${gradientId})`}
                  filter="url(#sectorShadow)"
                />
                {/* 구역 경계선에 그림자 효과 (원의 중심에서 가장자리까지) */}
                {/* 첫 번째 상품의 시작 경계선은 상품N 쪽으로 향하는 특별한 그림자 적용 */}
                <line
                  x1="50"
                  y1="50"
                  x2={startX}
                  y2={startY}
                  stroke="rgba(0, 0, 0, 0.1)"
                  strokeWidth="0.1"
                  strokeLinecap="round"
                  filter={isFirstItem ? "url(#borderShadowToLast)" : "url(#borderShadow)"}
                />
                {/* 마지막 상품의 끝 경계선은 그림자 없음 */}
                <line
                  x1="49.8"
                  y1="50"
                  x2={endX - 0.2}
                  y2={endY}
                  stroke="rgba(0, 0, 0, 0.2)"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  filter={isLastItem ? undefined : "url(#borderShadow)"}
                />
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
      <Pointer src="/images/Polygon.png" alt="포인터" />
    </RouletteContainer>
  )
}

export default Roulette

