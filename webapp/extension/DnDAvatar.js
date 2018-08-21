 sap.ui.define([
 		'sap/m/VBox',
 		'./jQuery'
 	], function (VBox, jQuery) {
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
 				events: {
 					"dragStart": {},
 					"dragEnd": {},
 					"drop": {
 						parameters: {
 							source: {
 								type: "object"
 							},
 							target: {
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

 		};
 		dndAvatar.prototype.onAfterRendering = function (oEvent) {
 			this.addDNDConfig();
 		};
 		dndAvatar.prototype.addDNDConfig = function (oEvent) {
 			var that = this;
 			var id = this.getId();
 			var domId = "#"+id;
 			$(domId).draggable({
 				cursor: 'move',
 				helper: "clone"
 			});
 			$(domId).droppable({
 				hoverClass: "dndHover",
 				drop: function (event, ui) {
 					var draggableId = ui.draggable.attr("id");
 					var droppableId = $(this).attr("id");
 					that.fireDrop({
 						source: sap.ui.getCore().byId(draggableId),
 						target: sap.ui.getCore().byId(droppableId)
 					});
 				}
 			});
 			$(domId).on('dragstart', function (event) {
 				that.fireDragStart();
 				that.addStyleClass('dndAvatarOnDrag');
 			});
 			$(domId).on('dragstop', function (event) {
 				that.fireDragEnd();
 				that.removeStyleClass('dndAvatarOnDrag');
 			});
 		};
 		return dndAvatar;
 	},
 	true);