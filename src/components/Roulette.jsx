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
  border: max(0.8vw, 8px) solid #fff;
  background: conic-gradient(
    ${props => props.gradientColors}
  );
  transition: transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99);
  transform: ${props => props.isSpinning ? `rotate(${props.rotation}deg)` : 'rotate(0deg)'};
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
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  border: max(0.6vw, 6px) solid #fff;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(16px, 2.5vw, 28px);
  font-weight: bold;
  color: white;
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

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#6C5CE7', '#A29BFE', '#FD79A8'
]

function Roulette({ items, onSpin, isSpinning, selectedItem }) {
  // 수량이 0보다 큰 상품만 필터링
  const availableItems = items.filter(item => item.quantity > 0)
  
  if (availableItems.length === 0) {
    return (
      <RouletteContainer>
        <Wheel>
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
        <CenterButton disabled>START</CenterButton>
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
    
    const color = colors[index % colors.length]
    return {
      item,
      startAngle,
      endAngle,
      color
    }
  })
  
  const gradientColors = itemAngles.map(({ color, startAngle, endAngle }) => 
    `${color} ${startAngle}deg ${endAngle}deg`
  ).join(', ')

  // 회전 각도 계산
  let rotation = 0
  if (isSpinning && selectedItem) {
    // 선택된 아이템의 중간 각도 찾기
    const selectedAngleInfo = itemAngles.find(({ item }) => item.name === selectedItem.name)
    if (selectedAngleInfo) {
      // 선택된 아이템의 중간 각도 (conic-gradient 기준: 0도는 오른쪽)
      const itemCenterAngle = (selectedAngleInfo.startAngle + selectedAngleInfo.endAngle) / 2
      // 포인터는 상단(-90도 또는 270도)에 있으므로
      // 선택된 아이템이 포인터에 오려면: -90 - itemCenterAngle
      // 양수로 변환: 270 - itemCenterAngle
      const targetAngle = 270 - itemCenterAngle
      // 여러 바퀴 회전 (5-10바퀴) - 음수 방향으로도 회전 가능하게
      const fullRotations = 5 + Math.random() * 5
      rotation = targetAngle + (fullRotations * 360)
    }
  }

  return (
    <RouletteContainer>
      <Wheel 
        gradientColors={gradientColors}
        isSpinning={isSpinning}
        rotation={rotation}
      />
      <CenterButton 
        onClick={onSpin}
        disabled={isSpinning}
      >
        {isSpinning ? '...' : 'START'}
      </CenterButton>
      <Pointer src="/images/Polygon.png" alt="포인터" />
    </RouletteContainer>
  )
}

export default Roulette

