import { IconButton, Subtitle } from 'app/components';
import { KWList } from '../core/types';
import ListDraggable from './ListDraggable';

type ListProps = {
  children?: React.ReactNode;
  list: KWList;
  listIndex: number;
  /** @todo edit(save) 버튼 만들어서 이벤트 핸들러에 연결 */
  onTitleEdit?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDeleteClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const List = ({ children, list, listIndex, onDeleteClick, ...props }: ListProps) => {
  return (
    <ListDraggable listId={list.id} listIndex={listIndex}>
      <div {...props} className="w-64 p-2 mr-2 bg-white rounded-lg shadow-lg h-fit">
        <div className="flex items-center justify-between mb-2">
          <Subtitle className="flex-1 pl-2 break-all" size="lg">
            {list.title}
          </Subtitle>
          <div className="flex justify-between ml-2">
            <IconButton
              name="remove"
              className="single-icon"
              aria-label="delete a list"
              onClick={onDeleteClick}
            />
          </div>
        </div>
        {children}
      </div>
    </ListDraggable>
  );
};

export default List;
