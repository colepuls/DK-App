import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { House, BadgePlus, MessageCircleQuestion } from 'lucide-react-native';

export default function Navigator() {
  const navigation = useNavigation();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <House size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Create')}>
        <BadgePlus size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Help')}>
        <MessageCircleQuestion size={24} />
      </TouchableOpacity>
    </View>
  );
}
