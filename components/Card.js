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
          <Tag size={14} color="#888" />
          <Text style={styles.moodText}>{dream.mood}</Text>
        </View>
      )}
      <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
        <EllipsisVertical size={22} color="#888" />
      </TouchableOpacity>
      {showMenu && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => { setShowMenu(false); onEdit(dream.id); }}>
            <Pencil size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowMenu(false); onDelete(dream.id); }}>
            <Trash size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#222',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  moodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodText: {
    marginLeft: 6,
    color: '#aaa',
  },
  menu: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: '#333',
    borderRadius: 6,
    padding: 6,
  },
});
