import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import Roulette from './components/Roulette'
import SettingsModal from './components/SettingsModal'
import WinnerModal from './components/WinnerModal'
// Fallback for missing title image

const AppContainer = styled.div`
  width: 100dvw;
  height: 100dvh;
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
  
  /* iPad resolution breakpoints */
  @media (min-width: 768px) and (max-width: 1024px) {
    /* iPad portrait mode */
  }

  @media (min-width: 1024px) {
    /* iPad landscape mode */
  }
`

const TitleContainer = styled.div`
  position: absolute;
  top: 2dvh;
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
  position: fixed;
  bottom: 2dvh;
  right: 2dvw;
  width: 6dvw;
  height: 6dvw;
  min-width: 50px;
  min-height: 50px;
  max-width: 80px;
  max-height: 80px;
  background: transparent;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1000;
  padding: 0;
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  @media (max-width: 768px) {
    bottom: 2dvh;
    right: 2dvw;
    min-width: 40px;
    min-height: 40px;
  }
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  &:disabled {
    pointer-events: none;
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
  
  @media (max-width: 768px) and (orientation: portrait) {
    margin-top: 5dvh;
    gap: 2dvh;
  }
  
  @media (max-width: 768px) and (orientation: landscape) {
    margin-top: 10vh;
    gap: 1.5vh;
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
  // Load items from localStorage
  const loadItemsFromStorage = () => {
    try {
      const storedItems = localStorage.getItem('roulette-items')
      if (storedItems) {
        return JSON.parse(storedItems)
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
    }
    // Default: 5 items
    return [
      { name: 'Item 1', quantity: 3 },
      { name: 'Item 2', quantity: 2 },
      { name: 'Item 3', quantity: 4 },
      { name: 'Item 4', quantity: 2 },
      { name: 'Item 5', quantity: 3 },
    ]
  }

  const [items, setItems] = useState(loadItemsFromStorage)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [winner, setWinner] = useState(null)
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false)
  const appContainerRef = useRef(null)

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('roulette-items', JSON.stringify(items))
    } catch (error) {
      console.error('Error saving data to localStorage:', error)
    }
  }, [items])

  // Prevent horizontal scroll (touch event handling)
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

      // Prevent horizontal scroll if horizontal movement is greater than vertical
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
    
    // Exclude items with 0 quantity
    const availableItems = items.filter(item => item.quantity > 0)
    if (availableItems.length === 0) {
      alert('No items available for draw.')
      return
    }

    // Start spin randomly (winner determined by 12 o'clock position after wheel stops)
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

    // Set selected item and start spinning (for rotation angle calculation)
    setSelectedItem(newSelectedItem)
    setIsSpinning(true)
  }

  const handleSpinComplete = (winnerItem) => {
    setIsSpinning(false)
    setWinner(winnerItem)
    setIsWinnerModalOpen(true)
    
    // Decrease quantity
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
        <TitleImage src="/images/title_img.png" alt="Roulette Game" />
      </TitleContainer>
      
      <SettingsButton 
        onClick={() => setIsSettingsOpen(true)}
        disabled={isSpinning}
      >
        <img src="/images/settings.png" alt="Settings" />
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
                <ExplainImage src="/images/explain.png" alt="Description" />
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
