import React, { useCallback } from 'react';
import TaskHeader from 'renderer/components/TaskHeader';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { TaskData } from 'renderer/models';
import TaskItem from 'renderer/components/TaskItem';
import { PopoverItem } from 'renderer/components/PopoverButton';
import useAppSelector from 'renderer/hooks/useAppSelector';

type TaskGroupItemProps = {
  title: string;
  filterValue: string;
  onAddTask?: (title: string) => void;
  count?: number;
  keyProp: string;
  toggle: (keyProp: string) => void;
  tasks: Array<TaskData>;
  isShow: boolean;
  updateTask: (taskId: string, channelId: string, data: any) => any;
  channelId: string;
  teamId: string;
  onSelectTask: (task: TaskData) => void;
  onUpdateStatus: (task: TaskData, status: string) => void;
  onMenuSelected: (menu: PopoverItem, task: TaskData) => void;
  onAddReact: (id: string, name: string, userId: string) => void;
  onRemoveReact: (id: string, name: string, userId: string) => void;
  onReplyTask: (task: TaskData) => void;
};

const TaskGroupItem = ({
  title,
  filterValue,
  onAddTask,
  count,
  keyProp,
  toggle,
  tasks,
  isShow,
  updateTask,
  channelId,
  teamId,
  onSelectTask,
  onUpdateStatus,
  onMenuSelected,
  onAddReact,
  onRemoveReact,
  onReplyTask,
}: TaskGroupItemProps) => {
  const reactData = useAppSelector((state) => state.reactReducer.reactData);
  const handleToggle = useCallback(() => toggle(keyProp), [keyProp, toggle]);
  const onCreateTask = useCallback(() => {
    onAddTask?.(title);
  }, [onAddTask, title]);
  const renderTask = useCallback(
    (task: TaskData, index: number) => (
      <Draggable
        key={task.task_id}
        draggableId={task.task_id}
        index={index}
        isDragDisabled={filterValue === 'Channel'}
      >
        {(dragProvided) => (
          <div
            ref={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            {...dragProvided.dragHandleProps}
            style={{
              ...dragProvided.draggableProps.style,
              userSelect: 'none',
            }}
          >
            <TaskItem
              updateTask={updateTask}
              channelId={channelId}
              teamId={teamId}
              onClick={onSelectTask}
              task={task}
              onUpdateStatus={onUpdateStatus}
              onMenuSelected={onMenuSelected}
              onAddReact={onAddReact}
              onRemoveReact={onRemoveReact}
              onReplyTask={onReplyTask}
              reacts={reactData?.[task.task_id]}
            />
          </div>
        )}
      </Draggable>
    ),
    [
      channelId,
      filterValue,
      onAddReact,
      onMenuSelected,
      onRemoveReact,
      onReplyTask,
      onSelectTask,
      onUpdateStatus,
      reactData,
      teamId,
      updateTask,
    ]
  );
  return (
    <div>
      <TaskHeader
        onCreate={
          filterValue === 'Status' && onAddTask ? onCreateTask : undefined
        }
        title={title}
        count={count}
        toggle={handleToggle}
        filterValue={filterValue}
      />
      <Droppable droppableId={`${keyProp}`} isCombineEnabled>
        {(provided) => {
          return (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <div style={{ height: 0.1, marginTop: 19.9 }} />
              {isShow && tasks.map(renderTask)}
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </div>
  );
};

export default TaskGroupItem;