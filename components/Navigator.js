import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { House, BadgePlus, MessageCircleQuestion } from 'lucide-react-native';

export default function Navigator() {
  const navigation = useNavigation();

  return (
    <View style={styles.nav}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <House size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Create')}>
        <BadgePlus size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Help')}>
        <MessageCircleQuestion size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
});
