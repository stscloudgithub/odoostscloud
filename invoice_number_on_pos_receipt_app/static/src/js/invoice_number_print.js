odoo.define('invoice_number_on_pos_receipt_app.invoice_number_print', function (require){
  'use_strict';

	var screens = require('point_of_sale.screens');	
	var gui = require('point_of_sale.gui');
	var models = require('point_of_sale.models');
	var PopupWidget = require('point_of_sale.popups');
	var core = require('web.core');
	var rpc = require('web.rpc');
	var utils = require('web.utils');
	var QWeb = core.qweb;
	var _t = core._t;
	var Widget = require('web.Widget');	

	screens.PaymentScreenWidget.include({
		finalize_validation: function() {
		var self = this;
		var order = this.pos.get_order();
		if (order.is_paid_with_cash() && this.pos.config.iface_cashdrawer) { 
				this.pos.proxy.printer.open_cashbox();
		}
		order.initialize_validation_date();
		order.finalized = true;
		if (order.is_to_invoice()) {
			var invoiced = this.pos.push_and_invoice_order(order);
			this.invoicing = true;
			invoiced.catch(this._handleFailedPushForInvoice.bind(this, order, false));
			invoiced.then(function (server_ids) {
				self.invoicing = false;
				var post_push_promise = [];
				post_push_promise = self.post_push_order_resolve(order, server_ids);
				post_push_promise.then(function () {
					rpc.query({
					model: 'pos.order',
					method: 'search_read',
					domain: [['pos_reference', '=', order['name']]],
					fields: ['account_move', 'fel_serie', 'fel_number', 'fel_date', 'fel_uuid', 'company_street', 'company_name_display'],
					},{async:false})
					.then(function(output){
						var inv_print = output[0]['account_move'][1].split(" ")[0]
						var fel_serie = output[0]['fel_serie']
						var fel_number = output[0]['fel_number']
						var fel_date = output[0]['fel_date']
						var fel_uuid = output[0]['fel_uuid']
						var company_street = output[0]['company_street']
						var company_name_display = output[0]['company_name_display']
						order.invoice_number = inv_print;
						order.fel_serie = fel_serie;
						order.fel_number = fel_number;
						order.fel_date = fel_date;
						order.fel_uuid = fel_uuid;
						order.company_street = company_street;
						order.company_name_display = company_name_display;
						self.gui.show_screen('receipt');
					});
				}).catch(function (error) {
					self.gui.show_screen('receipt');
					if (error) {
						self.gui.show_popup('error',{
							'title': "Error: no internet connection",
							'body': error,
						});
					}
				});
			});
		} else {
			var ordered = this.pos.push_order(order);
			if(order.wait_for_push_order()){
				var server_ids = [];
				ordered.then(function (ids) {
				server_ids = ids;
				}).finally(function() {
					var post_push_promise = [];
					post_push_promise = self.post_push_order_resolve(order, server_ids);
					post_push_promise.then(function () {
					self.gui.show_screen('receipt');
					}).catch(function (error) {
						self.gui.show_screen('receipt');
						if (error) {
							self.gui.show_popup('error',{
								'title': "Error: no internet connection",
								'body':  error,
							});
						}
					});
				});
			}
			else {
			  self.gui.show_screen('receipt');
			}
		}
	},
	});
});