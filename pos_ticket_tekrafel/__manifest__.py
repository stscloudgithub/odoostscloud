# -*- coding: utf-8 -*-


{
    'name': 'POS TICKET TEKRAFEL',
    'version': '1.0',
    'category': 'Hidden',
    'sequence': 6,
    'summary': 'TIKCET POS TEKRAFEL',
    'description': """

""",
    'depends': ['point_of_sale','tekrafel'],
    'data': [
        'views/templates.xml',
    ],
    'qweb': [
        'static/src/xml/Screens/ReceiptScreen/OrderReceipt.xml',
    ],
    'installable': True,
    'auto_install': False,
}
