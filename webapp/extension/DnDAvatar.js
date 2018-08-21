 sap.ui.define([
 		'sap/m/VBox',
 		'./DragInfo',
 		'./DropInfo'
 	], function (VBox, DragInfo, DropInfo) {
 		"use strict";

 		// Control extension
 		var dndAvatar = VBox.extend("pinaki.ey.CIO.allocation.CIOAllocation.extension.DnDAvatar", {
 			metadata: {
 				properties: {
 					text: {
 						type: "string"
 					},
 					selfMap: {
 						type: "boolean"
 					},
 					icon: {
 						type: "string"
 					}
 				},
 				aggregations: {
 					dragDropConfig: {
 						name: "dragDropConfig",
 						type: "sap.ui.core.dnd.DragDropBase",
 						multiple: true,
 						singularName: "dragDropConfig"
 					}
 				},
 				events: {
 					"dragStart": {},
 					"dragEnd": {},
 					"drop": {
 						parameters: {
 							dndEvent: {
 								type: "object"
 							}
 						}
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
 		dndAvatar.prototype.ghost = '';
 		dndAvatar.prototype.onBeforeRendering = function (oEvent) {
 			var that = this;
 			this.addItem(
 				new sap.ui.core.Icon({
 					height: '4rem',
 					color: "#fafafa",
 					src: this.getIcon()
 				}).addStyleClass('sapUiTinyMargin').addStyleClass('avatarIconSize')
 			);
 			this.addItem(
 				new sap.m.Text({
 					text: this.getText()
 				}).addStyleClass('sapUiTinyMargin').addStyleClass('whiteText')
 			);
 			this.setAlignItems('Center');
 			this.addDragDropConfig(new DragInfo({
 				dragStart: function () {
 					that.fireDragStart({});
 				},
 				dragEnd: function () {
 					that.fireDragEnd({});
 				}
 			}));
 			this.addDragDropConfig(new DropInfo({
 				drop: function (evt) {
 					that.fireDrop({
 						dndEvent: evt
 					});
 				}
 			}));
 		};
 		dndAvatar.prototype.onAfterRendering = function (oEvent) {

 		};
 		// Control extension for custom drop config
 		dndAvatar.prototype.ondragenter = function (oEvent) {
 			oEvent.dragSession.setIndicatorConfig({
 				borderRadius: "50%",
 				border: "3px solid rgb(82, 135, 179)",
 				// marginTop: ".25rem",
 				background: "#65a5a5"
 			});
 		};

 		return dndAvatar;

 	},
 	true);