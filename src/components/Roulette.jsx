import { useState, useEffect } from 'react'
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
  max-width: min(80vw, 80vh);
  max-height: min(80vw, 80vh);
  
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
  background-image: url('/images/button.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.4vw 2vw rgba(0, 0, 0, 0.3);
  z-index: 5;
  transition: all 0.3s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  &:hover:not(:disabled) {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 0.6vw 2.5vw rgba(0, 0, 0, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translate(-50%, -50%) scale(0.95);
  }
  
  &:disabled {
    opacity: 0.7;
  }
`

const Pointer = styled.img`
  position: absolute;
  top: -4vw;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  height: max(8vh, 70px);
  z-index: 10;
  filter: drop-shadow(0 0.2vw 0.4vw rgba(0, 0, 0, 0.3));
  pointer-events: none;
`

// 두 가지 그라데이션 패턴
const gradient1 = 'linear-gradient(135deg, #4037D3 0%, #FB6211 100%)'
const gradient2 = 'linear-gradient(135deg, #FB6213 0%, #E22E59 100%)'

function Roulette({ items, onSpin, isSpinning, selectedItem }) {
  const [currentRotation, setCurrentRotation] = useState(0)
  const [targetRotation, setTargetRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // 회전 후 최종 위치에서 포인터가 가리키는 아이템을 계산하는 함수
  const getItemAtPointer = (rotation, itemAngles) => {
    // 포인터는 위쪽(12시, SVG 기준 0도)에 있음
    // 룰렛이 시계 방향으로 rotation만큼 회전하면
    // 룰렛의 원래 0도 위치가 rotation만큼 회전한 위치로 이동
    // 포인터는 고정되어 있으므로, 포인터가 가리키는 룰렛의 각도는 -rotation
    // SVG 기준: 포인터가 가리키는 각도 = -rotation (mod 360)
    let pointerAngle = (-rotation) % 360
    if (pointerAngle < 0) pointerAngle += 360
    
    // conic-gradient 기준으로 변환: SVG 기준 0도(위쪽) = conic-gradient 기준 270도(위쪽)
    // SVG 기준 각도에서 90도를 더하면 conic-gradient 기준 각도
    let conicPointerAngle = (pointerAngle + 90) % 360
    if (conicPointerAngle < 0) conicPointerAngle += 360
    
    // 해당 각도에 있는 아이템 찾기
    for (const { item, startAngle, endAngle } of itemAngles) {
      // 각도 범위 체크
      let normalizedAngle = conicPointerAngle
      if (normalizedAngle < startAngle) normalizedAngle += 360
      
      if (normalizedAngle >= startAngle && normalizedAngle < endAngle) {
        return item
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
        
        // SVG path는 startAngle - 90을 사용하므로, SVG 기준으로는 0도가 위쪽(12시)
        // itemCenterAngle을 SVG 기준으로 변환: itemCenterAngle - 90
        // 이 각도는 현재 룰렛이 0도 회전 상태일 때의 아이템 위치
        let svgCenterAngle = itemCenterAngle - 90
        // 각도를 0~360 범위로 정규화
        while (svgCenterAngle < 0) svgCenterAngle += 360
        while (svgCenterAngle >= 360) svgCenterAngle -= 360
        
        // 포인터는 위쪽(12시, SVG 기준 0도)에 있음
        // 룰렛이 시계 방향으로 회전하면, 룰렛의 각도가 증가함
        // 선택된 아이템이 포인터에 오려면, 최종 회전 후 아이템의 SVG 기준 각도가 0도가 되어야 함
        // 최종 회전 후 위치: (svgCenterAngle + newTargetRotation) % 360 = 0
        // 따라서: newTargetRotation = -svgCenterAngle (mod 360) = 360 - svgCenterAngle
        // 하지만 현재 회전 상태(currentRotation)를 고려해야 함
        // 현재 아이템의 실제 위치: (svgCenterAngle + currentRotation) % 360
        // 목표: 이 위치를 0도로 이동
        // 필요한 추가 회전: 360 - ((svgCenterAngle + currentRotation) % 360)
        
        let currentItemPosition = (svgCenterAngle + currentRotation) % 360
        if (currentItemPosition < 0) currentItemPosition += 360
        
        // 포인터 위치(0도)로 이동하기 위한 회전 각도
        let targetAngle = 360 - currentItemPosition
        if (targetAngle >= 360) targetAngle -= 360
        
        // 시계방향으로 여러 바퀴 회전 (5-10바퀴)
        const fullRotations = 5 + Math.random() * 5
        
        // 최종 회전 각도 계산
        const newTargetRotation = currentRotation + targetAngle + (fullRotations * 360)
        
        // 검증: 회전 후 실제로 선택된 아이템이 포인터에 있는지 확인
        const finalItemAngles = itemAngles.map(({ item, startAngle, endAngle }) => ({
          item,
          startAngle,
          endAngle
        }))
        const itemAtPointer = getItemAtPointer(newTargetRotation, finalItemAngles)
        
        // 디버깅: 실제로 선택된 아이템이 포인터에 있는지 확인
        if (itemAtPointer && itemAtPointer.name !== selectedItem.name) {
          console.warn('회전 각도 계산 오류:', {
            selectedItem: selectedItem.name,
            itemAtPointer: itemAtPointer.name,
            svgCenterAngle,
            currentRotation,
            targetAngle,
            newTargetRotation
          })
        }
        
        setTargetRotation(newTargetRotation)
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
      }, 4000) // 4초 애니메이션
      
      return () => clearTimeout(timer)
    }
  }, [isAnimating, targetRotation])
  
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
            
            return (
              <g key={index}>
                <path
                  d={path}
                  fill={`url(#${gradientId})`}
                />
                <text
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize="4"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                  style={{
                    textShadow: '0 0 2px rgba(0, 0, 0, 0.5)',
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
      />
      <Pointer src="/images/Polygon.png" alt="포인터" />
    </RouletteContainer>
  )
}

export default Roulette

