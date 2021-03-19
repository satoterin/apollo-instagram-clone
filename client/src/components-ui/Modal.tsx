import React, { useEffect, useRef } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

export interface ModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside as any);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside as any);
    };
  }, [modalRef, isOpen, setIsOpen]);

  return isOpen ? (
    <div className='fixed top-0 left-0 z-50 w-screen h-screen bg-black bg-opacity-70'>
      <button
        className='absolute text-white top-5 right-10'
        onClick={() => setIsOpen(false)}
      >
        <AiOutlineClose size='1.8em' />
      </button>
      <div
        ref={modalRef}
        className='absolute w-full transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 md:w-5/12'
      >
        {children}
      </div>
    </div>
  ) : (
    <div></div>
  );
};

export default Modal;
