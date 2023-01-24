import { DeleteIcon } from '@chakra-ui/icons';
import { IconButton, ListItem } from '@chakra-ui/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

export function SortableSpace({ id, handleDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <ListItem ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <IconButton
        aria-label={`Delete ${id}`}
        icon={<DeleteIcon />}
        onClick={() => handleDelete(id)}
        mr={4}
        zIndex={2}
      />
      {id}
    </ListItem>
  );
}
