import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`

const ModalContent = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3vw;
  padding: 5vh;
  width: 90%;
  max-width: 60vw;
  text-align: center;
  box-shadow: 0 2vh 6vh rgba(0, 0, 0, 0.4);
  animation: ${fadeIn} 0.4s ease;
  border: max(0.4vw, 4px) solid white;
`

const WinnerTitle = styled.h2`
  color: white;
  font-size: clamp(24px, 4vw, 40px);
  margin: 0 0 3vh 0;
  text-shadow: 0.2vw 0.2vw 0.4vw rgba(0, 0, 0, 0.3);
`

const WinnerName = styled.div`
  background: white;
  border-radius: 2vw;
  padding: 3vh;
  margin-bottom: 3vh;
  font-size: clamp(28px, 4.5vw, 44px);
  font-weight: bold;
  color: #667eea;
  box-shadow: 0 0.5vh 1.5vh rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.5s ease 0.2s both;
`

const Confetti = styled.div`
  position: absolute;
  width: 1vw;
  height: 1vw;
  min-width: 8px;
  min-height: 8px;
  background: ${props => props.color};
  left: ${props => props.left}%;
  top: ${props => props.top}%;
  animation: fall ${props => props.duration}s linear infinite;
  
  @keyframes fall {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
`

const CloseButton = styled.button`
  background: white;
  color: #667eea;
  border: none;
  border-radius: 1.5vw;
  padding: 1.5vh 4vw;
  font-size: clamp(18px, 2.5vw, 24px);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0.4vh 1.5vh rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-0.2vh);
    box-shadow: 0 0.6vh 2vh rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const ConfettiContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
`

function WinnerModal({ winner, onClose }) {
  const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#F7DC6F', '#BB8FCE']
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ConfettiContainer>
          {Array.from({ length: 30 }).map((_, i) => (
            <Confetti
              key={i}
              color={confettiColors[i % confettiColors.length]}
              left={Math.random() * 100}
              top={-10}
              duration={2 + Math.random() * 2}
              style={{ animationDelay: `${Math.random() * 0.5}s` }}
            />
          ))}
        </ConfettiContainer>
        
        <WinnerTitle>🎉 당첨! 🎉</WinnerTitle>
        <WinnerName>{winner.name}</WinnerName>
        <CloseButton onClick={onClose}>확인</CloseButton>
      </ModalContent>
    </ModalOverlay>
  )
}

export default WinnerModal

