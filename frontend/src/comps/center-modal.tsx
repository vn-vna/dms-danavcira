import React, { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';

export type BottomModalProps = PropsWithChildren<{
  visible: boolean;
  onDismiss: () => void;
}>;

export default function CenterModal({ visible, onDismiss, children }: BottomModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onDismiss={() => {
        console.log("Dismissed");
      }}>
      <Pressable
        style={styles.modal_dissmiss}
        onPress={() => {
          onDismiss();
        }} />
      <View style={styles.modal_inner}>
        {children}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  header: {
    textAlign: "center",
    margin: 10,
  },
  modal_inner: {
    position: "absolute",
    width: "100%",
    height: "50%",
    top: "25%",
    padding: 30,
  },
  modal_dissmiss: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
});