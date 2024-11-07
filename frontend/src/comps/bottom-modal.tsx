import React, { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { Layout, Text } from '@ui-kitten/components';

export type BottomModalProps = PropsWithChildren<{
  visible: boolean;
  onDismiss: () => void;
}>;

export default function BottomModal({ visible, onDismiss, children }: BottomModalProps) {
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
        }}>
      </Pressable>
      <Layout style={styles.modal_inner}>
        {children}
      </Layout>
    </Modal>
  )
}

const styles = StyleSheet.create({
  header: {
    textAlign: "center",
    margin: 10,
  },
  modal_inner: {
    bottom: 0,
    position: "absolute",
    width: "100%",
    height: "50%",
    justifyContent: "center",
    alignItems: "center"
  },
  modal_dissmiss: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  }
});