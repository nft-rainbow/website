// const SERVICE_HOST = 'http://localhost:8080';
const SERVICE_HOST = 'https://console.nftrainbow.cn';

// TODO
// More tests
// 二维码

let userAddress = localStorage.getItem('user_address');
let netId = 1029;
const query = parseQuery();
const { id } = query;
if (!id) {
    alert('NO ID PROVIDED');
}

$(function() {
    console.log('Rainbow POAP');

    // Get poap basic info
    getPoap(id).then(result => {
        let contractAddrMeta = cfxAddr.decode(result.contract);
        netId = contractAddrMeta.netId;

        renderPoapInfo(result);
        $('#app').removeClass('d-none');
        $('#loading').addClass('d-none');
        if (userAddress) {
            userAddress = normalizeAddr(userAddress, netId);
            renderUserAddress(userAddress);
            // Get poap claim info
            getPoapClaimInfo(id, userAddress).then(result => {
                renderClaimInfo(result);
                $('#claim-btn').addClass('d-none');
                $('#view-btn').removeClass('d-none');
            });
        }
    }).catch(err => {
        alert('无效的POAP链接');
    });

    // click handler
    $('#claim-btn button').on('click', claimHandler);
});

function renderPoapInfo(poap) {
    const { title, intro, image_uri, contract } = poap;
    $('#img').attr('src', image_uri);
    $('#p-name').text(title);
    $('#p-intro').text(intro);
    $('#p-contract').html(renderLink(contract, scanAddressUrl(contract, netId)));
}

function renderClaimInfo(info) {
    const { token_id, hash } = info;
    if (hash) {
        $('#p-hash').html(renderLink(hash, scanTxUrl(hash, netId)));
        $('#p-nftid').html(renderLink(token_id, scanNFTUrl(info.contract, token_id, netId)));
    } else {
        $('#p-hash').html('<span>领取中，请稍后刷新</span>');
    }
    $('#claim-info').removeClass('d-none');
}

function renderUserAddress(address) {
    $('#p-address').html(renderLink(address, scanAddressUrl(address, netId)));
    $('#u-info').removeClass('d-none');
}

function parseQuery(query = location.search) {
    const result = {};
    if (!query) return result;
    query.slice(1).split('&').forEach(part => {
        const item = part.split('=');
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}

function getPoap(id) {
    return new Promise(function(resolve, reject) {
        $.get(`${SERVICE_HOST}/app/poap/${id}`)
        .success(resolve).fail(reject);
    });
}

function getPoapClaimInfo(id, addr) {
    return new Promise((resolve, reject) => {
        $.get(`${SERVICE_HOST}/app/poap/${id}/detail?address=${addr}`)
        .success(resolve).fail(reject);
    });
}

function claimPoap(id, address) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: `${SERVICE_HOST}/app/poap/${id}/claim`,
            data: JSON.stringify({address}),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: resolve,
            failure: reject
      });
    });
}

async function getAccount() {
    if (!anywebLoaded) return alert('请稍后重试');
    let accounts = await provider.request({
        method: 'cfx_accounts',
        params: [{
            availableNetwork: [1, 1029],
            scopes: ['baseInfo'],
        }],
    });
    return accounts;
}

async function claimHandler(e) {
    if (!userAddress) {
        let acc = await getAccount();
        userAddress = normalizeAddr(acc.address[0], netId);
        localStorage.setItem('user_address', userAddress);
        renderUserAddress(userAddress);
    }
    await claimPoap(id, userAddress);
    alert('领取成功，请稍后刷新页面查看');
}

function normalizeAddr(userAddr, netId) {
    userAddr = cfxAddr.decode(userAddr);
    return cfxAddr.encode(userAddr.hexAddress, netId);
}

function scanHost(netId = 1029) {
    return netId === 1029 ? 'https://confluxscan.net' : 'https://testnet.confluxscan.net';
}

function scanAddressUrl(address, netId) {
    return `${scanHost(netId)}/address/${address}`;
}

function scanTxUrl(txHash, netId) {
    return `${scanHost(netId)}/transaction/${txHash}`;
}

function scanNFTUrl(contract, tokenId, netId) {
    return `${scanHost(netId)}/nft/${contract}/${tokenId}`;
}

function renderLink(text, url) {
    return `<a href="${url}" target="_blank">${text}</a>`;
}