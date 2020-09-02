var CONFIG_LANG = [
    "dutch",
    "electrum",
    "english",
    "esperanto",
    "french",
    "german",
    "italian",
    "japanese",
    "lojban",
    "portuguese",
    "russian",
    "spanish"
];

var zerohex = "0000000000000000000000000000000000000000000000000000000000000000";
var ffhex = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

function genWallet(coinConfig, lang) {
    var current_lang = lang || 'english';

    var _seed = cnUtil.sc_reduce32(cnUtil.rand_32());
    var _keys = cnUtil.create_address(_seed);
    var _mnemonic = mn_encode(_seed, current_lang);

    cnUtil = cnUtilGen(coinConfig);
    var address = cnUtil.pubkeys_to_string(_keys.spend.pub, _keys.view.pub);

    var wallet = {
        address: address,
        spend_key: _keys.spend.sec,
        view_key: _keys.view.sec,
        mnemoric_words: _mnemonic
    }

    return wallet;
}

var qrcode = false;
function initQrCode(element) {
    var qrText = $(element).html();
    $('#qrCodeText').html(qrText);
    $('#modalTitle').html($(element).data('title'));
    qrcode.makeCode(qrText);
    $('#modalQrCode').modal('show');
}

function saveFile(title, wallet) {
    var text = "\n" + title;
    text += "\n\n------------ KEYS ------------";
    text += "\n\nMnemonic seed:\n" + wallet.mnemoric_words;
    text += "\n\nSpend key:\n" + wallet.spend_key;
    text += "\n\nView key:\n" + wallet.view_key;

    text += "\n\n------------ WALLET ------------";
    text += "\n\nAddress:\n" + wallet.address;
    text += "\n";

    text += "\n\n--------------------------------";
    text += "\n\nhttps:\\\\letshash.it - cryptocurrency mining pools\n\n"

    var file = new File([text], "WalletsKeys.txt", { type: "text/plain;charset=utf-8" });
    saveAs(file);
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

$('body').on('click', '.genwallet', function () {
    var el = $(this).parents().closest('.coin');
    var modal = $('#walletmodal');
    var title = el.find('.title').text() + ' Paper wallet';
    var wallet = genWallet({
        coinUnitPlaces: el.data('unitplaces'),
        addressPrefix: el.data('addressprefix')
    });

    new ClipboardJS('.btn-copy');
    if (qrcode) {
        qrcode.clear(); // clear the code.
        qrcode.makeCode("https://letshash.it");
    } else {
        qrcode = new QRCode(document.getElementById("qrcode"), {
            text: "https://letshash.it",
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    $('#qrcode').find('img').addClass('d-block mx-auto');
    $('.btn-qr-code').click(function () {
        var target = $(this).data('target');
        initQrCode(target);
    });

    $('.btn-save').show();
    $('.btn-save').click(function () {
        saveFile(title, wallet);
        $(this).hide();
        $(this).off('click');
    });

    modal.find('.modal-title').text(title);
    modal.find('.modal-body').find('.address').text(wallet.address);
    modal.find('.modal-body').find('.mnemoric').text(wallet.mnemoric_words);
    modal.find('.modal-body').find('.spendkey').text(wallet.spend_key);
    modal.find('.modal-body').find('.viewkey').text(wallet.view_key);

    modal.modal();
});