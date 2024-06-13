import { KWBoard, KWCard, KWUser } from 'kanbanwave';

export const defaultKWBoards = [
  {
    id: 'b3c2QPDV',
    title: 'Project 1'
  },
  {
    id: 'x48iB9qU',
    title: 'Project 2'
  },
  {
    id: 'NGG22KlI',
    title: '1-on-1 Meeting Agenda'
  },
  {
    id: 'HDE20c2A',
    title: 'Planning management'
  },
  {
    id: 'a820cDES',
    title: 'Scrum Board'
  }
];

export const makeCard = (
  id: string,
  writer: KWUser,
  title: string,
  description: string,
  startDate: string,
  dueDate: string,
  relativeDate: string | null
): KWCard => ({ id, writer, title, description, startDate, dueDate, relativeDate });

export const makeBoard = (id: string, title: string): KWBoard => ({ id, title });