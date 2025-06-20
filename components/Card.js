import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EllipsisVertical, Pencil, Trash, Tag } from 'lucide-react-native';

export default function DreamCard({ dream, onEdit, onDelete }) {
  const navigation = useNavigation();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('View', { id: dream.id })}
    >
      <Text style={styles.title}>{dream.title}</Text>
      {dream.mood && (
        <View style={styles.moodTag}>
          <Tag size={12} />
          <Text>{dream.mood}</Text>
        </View>
      )}
      <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
        <EllipsisVertical size={20} />
      </TouchableOpacity>
      {showMenu && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => { setShowMenu(false); onEdit(dream.id); }}>
            <Pencil size={18} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowMenu(false); onDelete(dream.id); }}>
            <Trash size={18} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  moodTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menu: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#ccc',
    borderRadius: 4,
    padding: 4,
  },
});