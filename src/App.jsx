import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import Roulette from './components/Roulette'
import SettingsModal from './components/SettingsModal'
import WinnerModal from './components/WinnerModal'
// Title 이미지가 없을 경우를 대비한 처리

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url('/images/bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  touch-action: pan-y;
  
  /* 아이패드 해상도 기준 */
  @media (min-width: 768px) and (max-width: 1024px) {
    /* 아이패드 세로 모드 */
  }
  
  @media (min-width: 1024px) {
    /* 아이패드 가로 모드 */
  }
`

const TitleContainer = styled.div`
  position: absolute;
  top: 4vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
`

const TitleImage = styled.img`
  max-width: 40vw;
  width: auto;
  height: auto;
  max-height: 12vh;
  display: block;
  
  @media (max-width: 768px) {
    max-width: 60vw;
    max-height: 10vh;
  }
`

const SettingsButton = styled.button`
  position: absolute;
  bottom: 4dvh;
  right: 4dvw;
  width: 6dvw;
  height: 6dvw;
  min-width: 40px;
  min-height: 40px;
  max-width: 80px;
  max-height: 80px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
  padding: 0;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const RouletteContainer = styled.div`
  margin-top: 5vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 3vh;
  width: 100%;
  max-width: 100vw;
  
  @media (max-width: 768px) {
    margin-top: 1vh;
    gap: 2vh;
  }
`

const ExplainImage = styled.img`
  max-width: 60vw;
  margin-top: 5vh;
  width: 100%;
  height: auto;
  display: block;
  
  @media (max-width: 768px) {
    max-width: 60vw;
    margin-top: 4vh;
  }
`

function App() {
  // 로컬스토리지에서 상품 목록 불러오기
  const loadItemsFromStorage = () => {
    try {
      const storedItems = localStorage.getItem('roulette-items')
      if (storedItems) {
        return JSON.parse(storedItems)
      }
    } catch (error) {
      console.error('로컬스토리지에서 데이터를 불러오는 중 오류 발생:', error)
    }
    // 기본값: 상품 5개
    return [
      { name: '상품 1', quantity: 3 },
      { name: '상품 2', quantity: 2 },
      { name: '상품 3', quantity: 4 },
      { name: '상품 4', quantity: 2 },
      { name: '상품 5', quantity: 3 },
    ]
  }

  const [items, setItems] = useState(loadItemsFromStorage)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [winner, setWinner] = useState(null)
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false)
  const appContainerRef = useRef(null)

  // items가 변경될 때마다 로컬스토리지에 저장
  useEffect(() => {
    try {
      localStorage.setItem('roulette-items', JSON.stringify(items))
    } catch (error) {
      console.error('로컬스토리지에 데이터를 저장하는 중 오류 발생:', error)
    }
  }, [items])

  // 가로 스크롤 방지 (터치 이벤트 처리)
  useEffect(() => {
    const container = appContainerRef.current
    if (!container) return

    let touchStartX = 0
    let touchStartY = 0

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return

      const touchCurrentX = e.touches[0].clientX
      const touchCurrentY = e.touches[0].clientY
      const deltaX = Math.abs(touchCurrentX - touchStartX)
      const deltaY = Math.abs(touchCurrentY - touchStartY)

      // 가로 이동이 세로 이동보다 크면 가로 스크롤 방지
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault()
      }
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  const handleSettingsSave = (newItems) => {
    setItems(newItems)
    setIsSettingsOpen(false)
  }

  const handleSpin = () => {
    if (isSpinning) return
    
    // 수량이 0인 상품 제외
    const availableItems = items.filter(item => item.quantity > 0)
    if (availableItems.length === 0) {
      alert('추첨할 상품이 없습니다.')
      return
    }

    // 랜덤으로 회전만 시작 (당첨 경품은 룰렛이 멈춘 후 실제 12시 위치에서 결정)
    const totalQuantity = availableItems.reduce((sum, item) => sum + item.quantity, 0)
    let random = Math.random() * totalQuantity
    
    let currentSum = 0
    let newSelectedItem = null
    for (const item of availableItems) {
      currentSum += item.quantity
      if (random <= currentSum) {
        newSelectedItem = item
        break
      }
    }

    // 선택된 아이템 설정 후 회전 시작 (회전 각도 계산용)
    setSelectedItem(newSelectedItem)
    setIsSpinning(true)
  }

  const handleSpinComplete = (winnerItem) => {
    setIsSpinning(false)
    setWinner(winnerItem)
    setIsWinnerModalOpen(true)
    
    // 수량 감소
    setItems(prevItems => 
      prevItems.map(item => 
        item.name === winnerItem.name 
          ? { ...item, quantity: Math.max(0, item.quantity - 1) }
          : item
      )
    )
  }

  const handleWinnerModalClose = () => {
    setIsWinnerModalOpen(false)
    setWinner(null)
  }

  return (
    <AppContainer ref={appContainerRef}>
      <TitleContainer>
        <TitleImage src="/images/title_img.png" alt="룰렛 게임" />
      </TitleContainer>
      
      <SettingsButton onClick={() => setIsSettingsOpen(true)}>
        <img src="/images/settings.png" alt="설정" />
      </SettingsButton>

              <RouletteContainer>
                <Roulette 
                  items={items} 
                  onSpin={handleSpin}
                  isSpinning={isSpinning}
                  selectedItem={selectedItem}
                  onSpinComplete={handleSpinComplete}
                  isWinnerModalOpen={isWinnerModalOpen}
                />
                <ExplainImage src="/images/explain.png" alt="설명" />
              </RouletteContainer>

      {isSettingsOpen && (
        <SettingsModal
          items={items}
          onSave={handleSettingsSave}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isWinnerModalOpen && winner && (
        <WinnerModal
          winner={winner}
          onClose={handleWinnerModalClose}
        />
      )}
    </AppContainer>
  )
}

export default App
