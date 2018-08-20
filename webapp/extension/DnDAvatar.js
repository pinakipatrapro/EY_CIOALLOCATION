 sap.ui.define([
 		'sap/m/VBox'
 	], function (VBox) {
 		"use strict";

 		// Control extension
 		var dndAvatar = VBox.extend("pinaki.ey.CIO.allocation.CIOAllocation.extension.DnDAvatar", {
 			metadata: {
 				properties: {
 					text: {
 						type: "string"
 					},
 					icon: {
 						type: "string"
 					}
 				}
 			},
 			renderer: {}
 		});

 		dndAvatar.prototype.init = function (oEvent) {
 			this.addStyleClass('dndAvatarStyle');
 			this.addStyleClass('sapUiSmallMargin');
 			VBox.prototype.init.apply(this, arguments);
 		};
 		dndAvatar.prototype.onBeforeRendering = function (oEvent) {
 			this.addItem(
 				new sap.ui.core.Icon({
 					height: '4rem',
 					color : "#fafafa",
 					src: this.getIcon()
 				}).addStyleClass('sapUiTinyMargin').addStyleClass('avatarIconSize')
 			);
 			this.addItem(
 				new sap.m.Text({
 					text: this.getText()
 				}).addStyleClass('sapUiTinyMargin').addStyleClass('whiteText')
 			);
 			this.setAlignItems('Center');
 			this.addDragDropConfig(new sap.ui.core.dnd.DragInfo());
 			this.addDragDropConfig(new sap.ui.core.dnd.DropInfo());
 		};
 		dndAvatar.prototype.onAfterRendering = function (oEvent) {
 			
 		};
 		// Control extension for custom drop config
 		dndAvatar.prototype.ondragenter = function (oEvent) {
 			oEvent.dragSession.setIndicatorConfig({
 				borderRadius: "50%",
 				border :"3px solid rgb(82, 135, 179)",
 				// marginTop: ".25rem",
 				background : "#65a5a5"
 			});
 		};

 		return dndAvatar;

 	},
 	true);