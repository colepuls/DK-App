import React from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function TitleModal({ visible, titleValue, onTitleChange, onSave, onCancel }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.heading}>Title your dream</Text>
          <TextInput
            value={titleValue}
            onChangeText={onTitleChange}
            placeholder="Enter title"
            placeholderTextColor="#888"
            style={styles.input}
            autoFocus
          />
          <View style={styles.btns}>
            <Button title="Save" onPress={onSave} color="#4CAF50" />
            <Button title="Cancel" onPress={onCancel} color="#E53935" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#000a',
  },
  box: {
    width: '80%',
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 12,
  },
  heading: {
    fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 12,
  },
  input: {
    borderWidth: 1, borderColor: '#555', padding: 12, color: '#fff', marginBottom: 20,
    borderRadius: 8,
  },
  btns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
