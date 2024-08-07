import { useEffect, useRef, useState } from 'react';
import { KWCard } from '../../core/types';
import CardDraggable from '../CardDraggable';
import TextArea from '../TextArea/TextArea';
import useDerivedState from '../../hooks/useDerivedState';
import styles from './Card.module.css';
import IconButton from '../IconButton/IconButton';
import Button from '../Button/Button';

type CardProps = {
  card: KWCard;
  cardIndex: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onTitleSave?: (newTitle: string) => void;
  onDeleteClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const Card = ({ card, cardIndex, onClick, onTitleSave, onDeleteClick }: CardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [internalTitle, setInternalTitle] = useDerivedState(card.title);
  const [isEditing, setIsEditing] = useState(false);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsEditing(false);
        setOverlayVisible(false);
        setInternalTitle(card.title);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, card.title, setInternalTitle]);

  useEffect(() => {
    if (containerRef.current) {
      setCardRect(containerRef.current.getBoundingClientRect());
    }
  }, [isEditing]);

  const handleTitleSave = () => {
    setIsEditing(false);
    if (internalTitle.trim() === '') {
      setInternalTitle(card.title);
    } else {
      onTitleSave?.(internalTitle);
    }
    setOverlayVisible(false);
  };

  const handleOverlayClick = () => {
    setIsEditing(false);
    setOverlayVisible(false);
    setInternalTitle(card.title);
  };

  return (
    <>
      {isOverlayVisible && (
        <div className={styles.overlay} onClick={handleOverlayClick} />
      )}
      <CardDraggable cardId={card.id} cardIndex={cardIndex}>
        <div
          className={styles.container}
          ref={containerRef}
          onClick={() => setIsEditing(true)}>
          {isEditing && cardRect ? (
            <div
              className={styles.editContainer}
              style={{
                top: `${cardRect.top}px`,
                left: `${cardRect.left}px`,
                width: `${cardRect.width}px`
              }}>
              <TextArea
                ref={inputRef}
                value={internalTitle}
                onChange={e => setInternalTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleTitleSave();
                  }
                }}
                style={{ minHeight: '4.5rem' }}
              />
              <div className={styles.action}>
                <Button
                  type="button"
                  size="md"
                  variant="contained"
                  onClick={handleTitleSave}>
                  Save
                </Button>
                <Button
                  type="button"
                  size="md"
                  variant="contained"
                  onClick={onDeleteClick}>
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={styles.wrapper}
              onClick={e => {
                onClick?.(e);
                if (!(e.target instanceof Element)) {
                  return;
                }
                if (e.target.closest('[data-event-target="menu-button"]')) {
                  e.preventDefault();
                }
              }}>
              <div className={styles.title}>{internalTitle}</div>
              <IconButton
                icon="edit"
                className={styles.editIcon}
                variant="text"
                size="xs"
                color="default"
                onClick={() => {
                  setIsEditing(true);
                  setOverlayVisible(true);
                }}
              />
            </div>
          )}
        </div>
      </CardDraggable>
    </>
  );
};

export default Card;
