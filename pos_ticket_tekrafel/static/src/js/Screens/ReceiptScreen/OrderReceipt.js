odoo.define('pos_ticket_tekrafel.OrderReceipt', function(require) {
    'use strict';

    var models = require('point_of_sale.models');
    const OrderReceipt = require('point_of_sale.OrderReceipt');
    const Registries = require('point_of_sale.Registries');
    const { useState, useContext } = owl.hooks;

    models.load_fields('account.journal','direccion_sucursal');

    models.load_models({
        model: 'account.journal',
        fields: [],
        domain: function(self){ return [['direccion_sucursal','!=',false]]; },
        loaded: function(self,journals){
            self.direccion_diario = "";
            self.telefono = "";
            if (journals.length > 0) {
                console.log('EL SELF')
                console.log(self.config.journal_id[0])

                journals.forEach(function(journal) {
                    console.log(journal.id)
                    console.log(self.config.invoice_journal_id[0])
                    if (journal.id == self.config.invoice_journal_id[0]){
                        self.direccion_diario = journal.direccion_sucursal;
                        self.telefono = journal.telefono;
                        console.log(self.direccion_diario)
                    }
                })

            }
        },
    });

    const PosTicketFelOrderReceipt = OrderReceipt =>
        class extends OrderReceipt {
            constructor() {
                super(...arguments);
                var order = this.env.pos.get_order();
                var self = this;
                console.log("self")
                console.log(self)
                console.log(order)
                this.state = useState({
                  'cliente_id': order.get_client(),
                  // 'qr_string': false,
                  // 'qr_string': "https://felgtaws.digifact.com.gt/guest/api/FEL?DATA=96524081%7CB96A30D0-22FC-44D2-8900-A4F1103A0AB7%7CGUESTUSERQR",
                  'feel_numero_autorizacion': false,
                  'feel_serie': false,
                  'feel_numero': false,
                  'nombre_diario': false,
                  'direccion': order.pos.direccion_diario,
                  'certificador_fel': false,
                  'telefono': order.pos.telefono,
                });

                var state = this.state;
                console.log(order)
                self.rpc({
                    model: 'pos.order',
                    method: 'search_read',
                    args: [[['pos_reference', '=', order.name]], []],
                }, {
                    timeout: 5000,
                }).then(function (orders) {
                    if (orders.length > 0 && 'account_move' in orders[0] && orders[0]['account_move'].length > 0) {
                        console.log(orders)
                        console.log("primer rpc")
                          self.rpc({
                            model: 'account.move',
                            method: 'search_read',
                            args: [[['id', '=', orders[0]['account_move'][0]  ]], []],
                        }, {
                            timeout: 5000,
                        }).then(function (facturas) {
                            if (facturas.length > 0) {
                                console.log('FACTURAS')
                                console.log(facturas)

                                // var receipt_env = self.get_receipt_render_env();
                                //
                                // console.log(order)


                                  self.rpc({
                                    model: 'account.journal',
                                    method: 'search_read',
                                    args: [[['id', '=', facturas[0].journal_id[0]  ]], []],
                                }, {
                                    timeout: 5000,
                                }).then(function (diario) {
                                    console.log(diario)
                                    // var direccion_id = self.pos.db.get_partner_by_id(diario[0]['direccion_id'][0]);
                                    // console.log(direccion_id)
                                    // console.log(order)
                                    state.codigo_qr = facturas[0].codigo_qr;
                                    state.numero_autorizacion_fel = facturas[0].numero_autorizacion_fel;
                                    state.serie_documento_fel = facturas[0].serie_documento_fel;
                                    state.numero_documento_fel = facturas[0].numero_documento_fel;
                                    // state.nombre_diario = direccion_id.name;
                                    // state.direccion = direccion_id.street +" " + direccion_id.street2 + ", " + direccion_id.city;
                                    state.certificador_fel = 'TEKRA, SOCIEDAD ANONIMA';
                                    var link = ["http://seguimiento.desa.tekra.com.gt/ver_documento.aspx?","UUID=",facturas[0].numero_autorizacion_fel.toString()].join('');
                                    state.qr_string = link;
                                });
                            }
                        });



                    }
                });
            }
        };



    Registries.Component.extend(OrderReceipt, PosTicketFelOrderReceipt);

    return OrderReceipt;

});
