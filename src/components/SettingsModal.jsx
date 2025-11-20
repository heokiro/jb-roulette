import { useState, useEffect } from 'react'
import styled from 'styled-components'

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
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

const ModalContent = styled.div`
  background: white;
  border-radius: 2vw;
  padding: 3vh;
  width: 90%;
  max-width: 80vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 1vh 4vh rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from {
      transform: translateY(5vh);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5vh;
  
  h2 {
    margin: 0;
    color: #333;
    font-size: clamp(20px, 3vw, 32px);
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: clamp(24px, 4vw, 40px);
  cursor: pointer;
  color: #666;
  padding: 0;
  width: clamp(35px, 5vw, 50px);
  height: clamp(35px, 5vw, 50px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5vh;
  margin-bottom: 2vh;
`

const ItemRow = styled.div`
  display: flex;
  gap: 1vw;
  align-items: center;
  min-width: 0;
  
  @media (max-width: 768px) {
    gap: 2vw;
  }
  
  @media (max-width: 480px) {
    gap: 3vw;
  }
`

const Input = styled.input`
  flex: 1 1 0;
  min-width: 0;
  padding: 1.2vh 1.2vw;
  border: 0.2vw solid #e0e0e0;
  border-radius: 0.8vw;
  font-size: clamp(16px, 1.8vw, 18px);
  transition: border-color 0.3s ease;
  -webkit-appearance: none;
  
  @media (max-width: 480px) {
    padding: 1.2vh 2vw;
    min-width: 80px;
  }
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const QuantityInput = styled(Input)`
  flex: 0 0 auto;
  width: 10vw;
  min-width: 70px;
  max-width: 100px;
  font-size: clamp(16px, 1.8vw, 18px);
  
  @media (max-width: 480px) {
    min-width: 60px;
    max-width: 80px;
  }
`

const DeleteButton = styled.button`
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 0.8vw;
  padding: 1.2vh 2vw;
  cursor: pointer;
  font-size: clamp(14px, 1.8vw, 18px);
  transition: background 0.3s ease;
  flex-shrink: 0;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    padding: 1.2vh 3vw;
    font-size: clamp(13px, 3.5vw, 16px);
  }
  
  &:hover {
    background: #ee5a6f;
  }
`

const AddButton = styled.button`
  width: 100%;
  padding: 1.5vh;
  background: #4ECDC4;
  color: white;
  border: none;
  border-radius: 0.8vw;
  font-size: clamp(16px, 2.2vw, 22px);
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 2vh;
  transition: background 0.3s ease;
  
  &:hover {
    background: #3db5ac;
  }
`

const SaveButton = styled.button`
  width: 100%;
  padding: 1.5vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.8vw;
  font-size: clamp(18px, 2.5vw, 24px);
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-0.2vh);
    box-shadow: 0 0.5vh 1.5vh rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`

function SettingsModal({ items, onSave, onClose }) {
  const [localItems, setLocalItems] = useState([...items])

  useEffect(() => {
    setLocalItems([...items])
  }, [items])

  // 모달이 열릴 때 body 스크롤 방지 및 복원
  useEffect(() => {
    // 모달이 열릴 때 body의 현재 스크롤 위치 저장
    const scrollY = window.scrollY
    const body = document.body
    const html = document.documentElement

    // body 스크롤 방지
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'

    // cleanup: 모달이 닫힐 때 스크롤 복원
    return () => {
      body.style.position = ''
      body.style.top = ''
      body.style.width = ''
      body.style.overflow = ''
      // 저장된 스크롤 위치로 복원
      window.scrollTo(0, scrollY)
    }
  }, [])

  const handleItemChange = (index, field, value) => {
    const newItems = [...localItems]
    if (field === 'quantity') {
      // 빈 문자열이면 빈 문자열로 유지
      if (value === '' || value === null || value === undefined) {
        newItems[index][field] = ''
        setLocalItems(newItems)
        return
      }
      // 앞에 0이 붙은 경우 제거 (예: "05" -> "5")
      const trimmedValue = value.replace(/^0+/, '') || '0'
      const numValue = parseInt(trimmedValue, 10)
      if (isNaN(numValue)) {
        newItems[index][field] = ''
      } else {
        newItems[index][field] = Math.max(0, numValue)
      }
    } else {
      newItems[index][field] = value
    }
    setLocalItems(newItems)
  }

  const handleDelete = (index) => {
    const newItems = localItems.filter((_, i) => i !== index)
    setLocalItems(newItems)
  }

  const handleAdd = () => {
    setLocalItems([...localItems, { name: '', quantity: 1 }])
  }

  const handleSave = () => {
    // 빈 상품명과 수량이 0이거나 빈 문자열인 항목 제거
    const validItems = localItems
      .map(item => ({
        ...item,
        quantity: item.quantity === '' || item.quantity === null || item.quantity === undefined ? 0 : Number(item.quantity)
      }))
      .filter(item => item.name.trim() !== '' && item.quantity > 0)
    onSave(validItems.length > 0 ? validItems : [{ name: '상품 1', quantity: 1 }])
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>룰렛 설정</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ItemList>
          {localItems.map((item, index) => (
            <ItemRow key={index}>
              <Input
                type="text"
                placeholder="상품명"
                value={item.name}
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
              />
              <QuantityInput
                type="number"
                placeholder="수량"
                min="0"
                value={item.quantity === 0 || item.quantity === '' ? '' : item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              />
              <DeleteButton onClick={() => handleDelete(index)}>
                삭제
              </DeleteButton>
            </ItemRow>
          ))}
        </ItemList>

        <AddButton onClick={handleAdd}>+ 상품 추가</AddButton>
        <SaveButton onClick={handleSave}>저장</SaveButton>
      </ModalContent>
    </ModalOverlay>
  )
}

export default SettingsModal

