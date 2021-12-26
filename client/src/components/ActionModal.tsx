import Card from '../shared/Card';
import Modal from '../shared/Modal';
import { ModalProps } from '../prop-types/ModalProps';
import './ActionModal.css';

const ActionModal: React.FC<ModalProps> = ({ isOpen, setIsOpen, children }) => {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <Card className='rounded-lg'>
        <ul className='action-modal-list'>
          {children}
          <li
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Cancel
          </li>
        </ul>
      </Card>
    </Modal>
  );
};

export default ActionModal;
