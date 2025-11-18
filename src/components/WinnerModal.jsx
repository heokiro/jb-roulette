import styled, { keyframes } from 'styled-components'

const fadeInOverlay = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const fadeInContent = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const fadeInName = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
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
  animation: ${fadeInOverlay} 0.3s ease;
`

const ModalContent = styled.div`
  background-image: url('/images/popup.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 3vw;
  padding: 5vh;
  width: 90%;
  max-width: 60vw;
  min-height: 80vh;
  aspect-ratio: 4 / 3;
  text-align: center;
  animation: ${fadeInContent} 0.4s ease;
  cursor: pointer;
  position: relative;
`

const WinnerName = styled.div`
  position: absolute;
  top: 58%;
  left: 50%;
  font-size: clamp(28px, 4.5vw, 44px);
  font-weight: bold;
  color: white;
  text-align: center;
  animation: ${fadeInName} 0.5s ease 0.2s both;
  pointer-events: none;
  line-height: 1.4;
`

function WinnerModal({ winner, onClose }) {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={onClose}>
        <WinnerName>
          <span style={{ whiteSpace: 'nowrap' }}>{winner.name} 당첨!</span>
        </WinnerName>
      </ModalContent>
    </ModalOverlay>
  )
}

export default WinnerModal

