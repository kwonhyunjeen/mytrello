import { ChangeEvent, useEffect, useState } from 'react';
import TextArea from '../TextArea/TextArea';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import IconButton from '../IconButton/IconButton';
import styles from './NewCard.module.css';

type NewCardProps = {
  cardsLength?: number;
  onAdd?: (title: string) => void;
};

const NewCard = ({ cardsLength, onAdd }: NewCardProps) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [title, setTitle] = useState('');

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
  };

  const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (title.trim() !== '') {
      onAdd?.(title);
      setTitle('');
    }
  };

  const handleCancelClick = () => {
    setTitle('');
    setIsInputVisible(false);
  };

  useEffect(() => {
    if (cardsLength === 0) {
      setIsInputVisible(true);
    } else {
      setIsInputVisible(false);
    }
  }, [cardsLength]);

  return (
    <div>
      {isInputVisible ? (
        <>
          <TextArea
            placeholder={`Enter a card title`}
            value={title}
            onChange={handleChange}
          />
          <div className={styles.action}>
            <Button type="button" size="sm" variant="contained" onClick={handleAddClick}>
              Add card
            </Button>
            <IconButton
              type="button"
              size="sm"
              icon="close"
              aria-label="cancel"
              onClick={handleCancelClick}
            />
          </div>
        </>
      ) : (
        <Button
          aria-label={`add a card`}
          onClick={() => setIsInputVisible(true)}
          startIcon={<Icon name="add" />}>
          Add a card
        </Button>
      )}
    </div>
  );
};

export default NewCard;
