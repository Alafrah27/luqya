import React, { forwardRef, useMemo } from 'react';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';

const CustomBottomSheetModal = forwardRef((props, ref) => {
    const snapPoints = useMemo(() => ['50% ', "75%", "96%"], []);

    return (
        <BottomSheetModal
            ref={ref}
            snapPoints={snapPoints}
            index={0}
            enablePanDownToClose={true}
            handleIndicatorStyle={{ backgroundColor: '#ffffff' }}

            // Detach from the portal for a moment to see if it's a layout issue
            stackBehavior="push"
        >
            <BottomSheetScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >

                <BottomSheetView
                    style={{ flex: 1 }}
                >
                    {props.children}
                </BottomSheetView>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
});

CustomBottomSheetModal.displayName = 'CustomBottomSheetModal';


export default CustomBottomSheetModal;