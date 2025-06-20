import React from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function TitleModal({ visible, titleValue, onTitleChange, onSave, onCancel }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.heading}>Title your dream</Text>
          <TextInput
            value={titleValue}
            onChangeText={onTitleChange}
            placeholder="Enter title"
            style={styles.input}
            autoFocus
          />
          <Button title="Save" onPress={onSave} />
          <Button title="Cancel" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#00000088'
  },
  box: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5
  },
  heading: {
    fontSize: 20, fontWeight: 'bold', marginBottom: 10
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10
  }
});