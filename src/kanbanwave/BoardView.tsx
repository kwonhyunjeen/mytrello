import { Title } from 'app/components';
import { Fragment, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { date, dummy } from 'app/utils';
import NewList from './NewList';
import { useKanbanBoardContent } from './KanbanStorageProvider';
import List from './List';
import ListDroppable from './ListDroppable';
import NewCard from './NewCard';
import CardDroppable from './CardDroppable';
import Card from './Card';
import {
  KWBoard,
  KWBoardUUID,
  KWCard,
  KWCardForm,
  KWItemType,
  KWList,
  KWListForm
} from './types';

type BoardViewProps = {
  boardId: KWBoardUUID;
  cardRender?: (provided: {
    Component: typeof Card;
    props: React.ComponentPropsWithRef<typeof Card>;
    meta: { board: KWBoard; list: KWList; card: KWCard };
  }) => React.ReactNode;
};

const BoardView = ({ boardId: boardIdProp, cardRender }: BoardViewProps) => {
  const boardContentStore = useKanbanBoardContent();

  const { lists, ...board } = boardContentStore.getBoardContent(boardIdProp);

  const handleListAdd = useCallback(
    (title: string) => {
      const list: KWListForm = { title };
      boardContentStore.createList(board.id, list);
    },
    [boardContentStore, board.id]
  );

  const handleListDelete = useCallback(
    (listId: string) => () => {
      boardContentStore.deleteList(board.id, listId);
    },
    [boardContentStore, board.id]
  );

  const handleCardAdd = useCallback(
    (listId: string) => (title: string) => {
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
      boardContentStore.createCard(board.id, listId, card);
    },
    [boardContentStore, board.id]
  );

  const handleCardDelete = useCallback(
    (listId: string, cardId: string) => () => {
      boardContentStore.deleteCard(board.id, listId, cardId);
    },
    [boardContentStore, board.id]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { type, draggableId, source, destination } = result;
      if (!destination) return;

      if (type === KWItemType.LIST) {
        boardContentStore.reorderList(
          destination.droppableId,
          draggableId,
          destination.index
        );
      } else if (type === KWItemType.CARD) {
        boardContentStore.reorderCard(
          board.id,
          source.droppableId,
          destination.droppableId,
          draggableId,
          destination.index
        );
      }
    },
    [boardContentStore, board.id]
  );

  return (
    <section className="app-base">
      <Title className="mb-4 text-white">{board.title}</Title>
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
              onDeleteClick={handleListDelete(list.id)}>
              <CardDroppable
                listId={list.id}
                buttonSlot={
                  <NewCard
                    cardsLength={list.cards?.length}
                    onAdd={handleCardAdd(list.id)}
                  />
                }
                className="flex flex-col p-2">
                {list.cards?.map((card, index) => {
                  const cardProps = {
                    card: card,
                    cardIndex: index,
                    onDeleteClick: handleCardDelete(list.id, card.id)
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
