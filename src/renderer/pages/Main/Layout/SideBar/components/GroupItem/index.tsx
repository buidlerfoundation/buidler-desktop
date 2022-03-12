import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import GroupChild from '../GroupChild';
import GroupTitle from '../GroupTitle';
import { useHistory } from 'react-router-dom';
import { Collapse } from 'react-collapse';

type GroupItemProps = {
  group: any;
  onCreateChannel: (group: any) => void;
  channel: Array<any>;
  currentChannel: any;
  onContextChannel: (e: any, channel: any) => void;
  onContextGroupChannel: (e: any) => void;
};

const GroupItem = ({
  group,
  onCreateChannel,
  channel,
  currentChannel,
  onContextGroupChannel,
  onContextChannel,
}: GroupItemProps) => {
  const history = useHistory();
  const [isCollapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => setCollapsed(!isCollapsed);
  return (
    <Droppable droppableId={`group-channel-${group.group_channel_id}`}>
      {(provided) => {
        return (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <div>
              <div onContextMenu={onContextGroupChannel}>
                <GroupTitle
                  title={group?.group_channel_name}
                  onCreateChannel={() => onCreateChannel(group)}
                  isCollapsed={isCollapsed}
                  toggleCollapsed={toggleCollapsed}
                />
              </div>
              <Collapse isOpened={!isCollapsed}>
                {channel
                  ?.filter(
                    (c: any) => c?.group_channel_id === group?.group_channel_id
                  )
                  .sort((a1, a2) => {
                    if (a1.channel_name < a2.channel_name) return 1;
                    if (a1.channel_name > a2.channel_name) return -1;
                    return 0;
                  })
                  .sort((b1, b2) => {
                    if (b1.channel_type < b2.channel_type) return 1;
                    return -1;
                  })
                  ?.map?.((c: any, idx: number) => {
                    return (
                      <Draggable
                        key={c.channel_id}
                        draggableId={c.channel_id}
                        index={idx}
                      >
                        {(dragProvided) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            onContextMenu={(e) => onContextChannel(e, c)}
                          >
                            <GroupChild
                              type="text"
                              title={c.channel_name}
                              isSelected={
                                currentChannel.channel_id === c.channel_id
                              }
                              onPress={() => {
                                history.replace(
                                  `/home?channel_id=${c.channel_id}`
                                );
                              }}
                              isPrivate={c.channel_type === 'Private'}
                              isUnSeen={!c.seen}
                              isMuted={c.notification_type === 'Muted'}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
              </Collapse>
            </div>
            {provided.placeholder}
          </div>
        );
      }}
    </Droppable>
  );
};

export default GroupItem;
