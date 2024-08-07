import { Input, Subtitle } from 'app/components';
import { Fragment, useEffect, useRef, useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { date, dummy } from 'app/utils';
import {
  KWBoard,
  KWBoardUUID,
  KWCard,
  KWCardForm,
  KWItemType,
  KWList,
  KWListForm
} from '../core/types';
import Card from '../components/Card';
import CardDroppable from '../components/CardDroppable';
import List from '../components/List';
import ListDroppable from '../components/ListDroppable';
import NewCard from '../components/NewCard';
import NewList from '../components/NewList';
import useQuery from '../hooks/useQuery';
import { useKanbanwaveStore } from './KanbanStorageProvider';
import useDerivedState from '../hooks/useDerivedState';

type BoardViewProps = {
  boardId: KWBoardUUID;
  cardRender?: (provided: {
    Component: typeof Card;
    props: React.ComponentPropsWithRef<typeof Card>;
    meta: { board: KWBoard; list: KWList; card: KWCard };
  }) => React.ReactNode;
  newCardRender?: (provided: {
    Component: typeof NewCard;
    props: React.ComponentPropsWithRef<typeof NewCard>;
    meta: { board: KWBoard; list: KWList };
  }) => React.ReactNode;
};

const BoardView = ({
  boardId: boardIdProp,
  cardRender,
  newCardRender
}: BoardViewProps) => {
  const {
    getBoardContent,
    updateBoard,
    createList,
    updateList,
    deleteList,
    reorderList,
    createCard,
    updateCard,
    deleteCard,
    reorderCard
  } = useKanbanwaveStore();

  const { status, data: serverData, error } = useQuery(getBoardContent, [boardIdProp]);
  
  const [data, setData] = useState<NonNullable<typeof serverData>>({
    id: '',
    title: '',
    lists: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [internalTitle, setInternalTitle] = useDerivedState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setInternalTitle(serverData?.title || '');
  }, [serverData?.title, setInternalTitle]);

  useEffect(() => {
    if (status === 'resolved') {
      setData(serverData);
    } else if (status === 'rejected') {
      console.error('Failed to fetch board content: ', error);
    }
  }, [status, serverData, error]);

  if (status === 'pending' && !serverData) {
    return (
      <div>
        <mark>Loading...</mark>
      </div>
    );
  }

  const { lists, ...board } = data;

  const handleListAdd = (title: string) => {
    const list: KWListForm = { title };
    createList(board.id, list);
  };

  const makeListDeleteClickHandler = (listId: string) => () => {
    deleteList(board.id, listId);
  };

  const makeCardAddHandler = (listId: string) => (title: string) => {
    const currentDate = new Date();
    const card: KWCardForm = {
      title,
      writer: {
        id: dummy.randomUUID(),
        name: dummy.randomName(),
        email: dummy.randomEmail()
      },
      description: dummy.randomParagraphs(5),
      startDate: date.makeDayMonthYear(currentDate),
      dueDate: date.makeDayMonthYear(currentDate)
    };
    createCard(board.id, listId, card);
  };

  const makeCardDeleteClickHandler = (listId: string, cardId: string) => () => {
    deleteCard(board.id, listId, cardId);
  };

  const handleDragEnd = (result: DropResult) => {
    const { type, draggableId, source, destination } = result;
    if (!destination) return;

    if (type === KWItemType.LIST) {
      const originLists = data.lists;
      const newListOrders = [...originLists];
      const [removed] = newListOrders.splice(source.index, 1);
      newListOrders.splice(destination.index, 0, removed);
      setData(prev => ({ ...prev, lists: newListOrders }));

      try {
        reorderList(board.id, draggableId, destination.index);
      } catch (error) {
        console.error('Failed to change list order:', error);
        setData({ ...data, lists: originLists });
      }
    } else if (type === KWItemType.CARD) {
      if (source.droppableId === destination.droppableId) {
        const sourceList = data.lists.find(list => list.id === source.droppableId);
        if (!sourceList) return;

        const newCards = [...sourceList.cards];
        const [remove] = newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, remove);

        setData(prev => ({
          ...prev,
          lists: prev.lists.map(list => {
            if (list.id === source.droppableId) {
              return { ...list, cards: newCards };
            }
            return list;
          })
        }));

        try {
          reorderCard(
            board.id,
            source.droppableId,
            destination.droppableId,
            draggableId,
            destination.index
          );
        } catch (error) {
          console.error('Failed to change card order: ', error);
          setData(prev => ({
            ...prev,
            lists: prev.lists.map(list => {
              if (list.id === source.droppableId) {
                return { ...list, cards: sourceList.cards };
              }
              return list;
            })
          }));
        }
      } else {
        const sourceList = data.lists.find(list => list.id === source.droppableId);
        const destinationList = data.lists.find(
          list => list.id === destination.droppableId
        );
        if (!sourceList || !destinationList) return;

        const newSourceCards = [...sourceList.cards];
        const newDestinationCards = [...destinationList.cards];
        const [remove] = newSourceCards.splice(source.index, 1);
        newDestinationCards.splice(destination.index, 0, remove);

        setData(prev => ({
          ...prev,
          lists: prev.lists.map(list => {
            if (list.id === source.droppableId) {
              return { ...list, cards: newSourceCards };
            }
            if (list.id === destination.droppableId) {
              return { ...list, cards: newDestinationCards };
            }
            return list;
          })
        }));

        try {
          reorderCard(
            board.id,
            source.droppableId,
            destination.droppableId,
            draggableId,
            destination.index
          );
        } catch (error) {
          console.error('Failed to change card order:', error);
          setData(prev => ({
            ...prev,
            lists: prev.lists.map(list => {
              if (list.id === source.droppableId) {
                return { ...list, cards: sourceList.cards };
              }
              if (list.id === destination.droppableId) {
                return { ...list, cards: destinationList.cards };
              }
              return list;
            })
          }));
        }
      }
    }
  };

  const handleBoardTitleSave = () => {
    setIsEditing(false);
    if (internalTitle.trim() === '') {
      setInternalTitle(data.title);
    } else {
      updateBoard({ id: boardIdProp, title: internalTitle });
    }
  };

  const makeListTitleSaveHandler = (listId: string) => (newTitle: string) => {
    const listToUpdate = data.lists.find(list => list.id === listId);
    if (listToUpdate) {
      const updatedList = { ...listToUpdate, title: newTitle };
      updateList(board.id, updatedList);
    }
  };
     
  const makeCardTitleSaveHandler = (listId: string, card: KWCard) => (newTitle: string) => {
    const cardToUpdate = data.lists
      .find(list => list.id === listId)
      ?.cards.find(c => c.id === card.id);
    if (cardToUpdate) {
      const updatedCard = { ...cardToUpdate, title: newTitle };
      updateCard(board.id, listId, updatedCard);
    }
  }
  
  return (
    <section className="app-base">
      <div className="board-header flex max-w-full w-[calc(100%-23px)] py-3">
        <div className="flex items-center h-8 cursor-pointer hover:bg-gray-500 hover:rounded-md">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={internalTitle}
              onChange={e => setInternalTitle(e.target.value)}
              onBlur={handleBoardTitleSave}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleBoardTitleSave();
                }
              }}
              className="px-2 text-xl font-bold rounded-sm input-sm"
            />
          ) : (
            <Subtitle
              size="xl"
              className="px-2 font-bold text-white"
              onClick={() => setIsEditing(true)}>
              {internalTitle}
            </Subtitle>
          )}
        </div>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <ListDroppable
          boardId={board.id}
          buttonSlot={<NewList onAdd={handleListAdd} listsLength={lists.length} />}
          className="flex justify-start">
          {lists.map((list, index) => (
            <List
              key={list.id}
              list={list}
              listIndex={index}
              onDeleteClick={makeListDeleteClickHandler(list.id)}
              onTitleSave={makeListTitleSaveHandler(list.id)}
              >
              <CardDroppable
                listId={list.id}
                buttonSlot={(() => {
                  const newCardProps = {
                    cardsLength: list.cards?.length,
                    onAdd: makeCardAddHandler(list.id)
                  };
                  return newCardRender ? (
                    newCardRender({
                      Component: NewCard,
                      props: newCardProps,
                      meta: { board, list }
                    })
                  ) : (
                    <NewCard {...newCardProps} />
                  );
                })()}
                className="flex flex-col p-2">
                {list.cards?.map((card, index) => {
                  const cardProps = {
                    card: card,
                    cardIndex: index,
                    onDeleteClick: makeCardDeleteClickHandler(list.id, card.id),
                    onTitleSave: makeCardTitleSaveHandler(list.id, card)
                  };
                  return (
                    <Fragment key={`${list.id}:${card.id}`}>
                      {cardRender ? (
                        cardRender({
                          Component: Card,
                          props: cardProps,
                          meta: { board, list, card }
                        })
                      ) : (
                        <Card {...cardProps} />
                      )}
                    </Fragment>
                  );
                })}
              </CardDroppable>
            </List>
          ))}
        </ListDroppable>
      </DragDropContext>
    </section>
  );
};

export default BoardView;
