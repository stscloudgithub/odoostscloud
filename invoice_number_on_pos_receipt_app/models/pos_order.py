# -*- coding: utf-8 -*-
from odoo import api, fields, models, _

class PosOrder(models.Model):
    _inherit = "pos.order"

    fel_serie = fields.Char('Serie Fel', related="account_move.serie_documento_fel")
    fel_number = fields.Char('Numero Fel', related="account_move.numero_documento_fel")
    fel_date = fields.Char('Fecha Fel', related="account_move.fecha_fel")
    fel_uuid = fields.Char('UUID Fel', related="account_move.numero_autorizacion_fel")
    company_street = fields.Char('Direccion Comercial', compute="_compute_company_street")
    company_name_display = fields.Char('Nombre Comercial', compute="_compute_company_street")

    @api.depends('account_move')
    def _compute_company_street(self):
        for rec in self:
            company_street = ""
            company_name = ""
            if rec.account_move:
                if rec.account_move.journal_id.direccion_sucursal:
                    company_street = rec.account_move.journal_id.direccion_sucursal
                if rec.account_move.journal_id.nombre_comercial_fel:
                    company_name = rec.account_move.journal_id.nombre_comercial_fel
                else:
                    company_street = rec.account_move.company_id.street
                    company_name = rec.account_move.company_id.name
            rec.update({
                'company_street': company_street,
                'company_name_display': company_name,
            })

PosOrder()