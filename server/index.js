var PORT = 65152;
//client states: 0 (authed) 1 (idle) 2 (live) 3 (hidden)
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
let clients = new Map()
let FPS = 60
let sectors = new Map()
function strbuf(str){
    let b = Buffer.from("\x00\x00\x00\x00"+str)
    b.writeUint32LE(b.length-4)
    return b
}

server.on('listening', function() {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ':' + address.port);
});
class ClientData{
    constructor(name = "Player", sector = 0, remote = ""){
        this.remote = remote+""
        this.name = name+""
        this.sector = sector >>> 0
        this.state = 0
        this.x = 0.1
        this.y = 0.1
        this.dx = 0.1
        this.dy = 0.1
        this.z = 0.1
        this.dz = 0.1
        this.texture = 0
        this.radius = 0.1
        this.thrust = 0
        this.mass = 0.1
        this.u = Date.now()
    }
    ready(x, y, dx, dy, z, dz, ship, thrust, mass){
        this.x = +x
        this.y = +y
        this.z = +z
        this.dx = +dx
        this.dy = +dy
        this.dz = +dz
        this.mass = +mass
        this.ship = ship >>> 0 //0x0000 - 0xFF3F
        this.thrust = thrust >>> 0
        this.state = texture ? (dx || dy ? 2 : 1) : 3
        this.u = Date.now()
    }
    validate(buffer = Buffer()){
        //let delay = -0.001 * FPS * (this.u - (this.u=Date.now()))
        if(buffer.length < 20)return null
        let x = buffer.readFloatLE(0)
        let y = buffer.readFloatLE(4)
        let dx = buffer.readFloatLE(8)
        let dy = buffer.readFloatLE(12)
        let z = buffer.readInt8(16) / 40
        let dz = buffer.readInt8(17)
        let thrust = buffer[18]
        let ship = buffer[19]
        let level = thrust >> 3
        if(true){
            this.ship = (ship << 8) + level
        }
        let mult = 1
        let amult = 1
        if(thrust & 1){
            this.dx += -sin(z) * mult / 30
            this.dy += cos(z) * mult / 30
            producesParticles = true
        }
        this.thrust = thrust & 7
        if(thrust & 4) dz -= 0.002
        if(thrust & 2) dz += 0.002
        this.x += dx
        this.y += dy
        this.z += dz
        
        let buf = Buffer.alloc(20)
        let update = false
        if(Math.abs(this.dx - dx) < mult / 60)this.dx = dx, update = true
        if(Math.abs(this.dx - dx) < mult / 60)this.dy = dy, update = true
        if(Math.abs(this.x - x) < dx * 0.5)this.x = x, update = true
        if(Math.abs(this.y - y) < dy * 0.5)this.y = y, update = true
        if(Math.abs(this.dz - dz) < amult * 0.001)this.dz = dz, update = true
        if(Math.abs(this.z - z) < dz * 0.5)this.z = z, update = true
        if(update)return this.tobuf()
        return null
    }
    toBuf(){
        buf.writeFloatLE(this.x)
        buf.writeFloatLE(this.y)
        buf.writeFloatLE(this.dx)
        buf.writeFloatLE(this.dy)
        buf.writeFloatLE(this.z)
        buf.writeFloatLE(this.dz)
    }
}
server.on('message', function(message, remote) {
    let send = a=>server.send(a,remote.port,remote.address,e => e && console.log(e))
    let address = remote.address + remote.port
    if(message[0] === 0){
        try{
            let version = message.readUint16LE(1)
            let len = message.readUint32LE(3)
            if(len > 64)throw new RangeError()
            let name = message.subarray(7,7+len).toString()
            clients.set(address, new ClientData(name, 0))
            send(Buffer.from([1, 0, 0, 0, 0]))
        }catch(e){
            send(Buffer.from(Buffer.concat([Buffer.of(127), strbuf('Connection failed')]))) //disconnect message
        }
    }
    msg(message,send,address)
});

server.bind(PORT);

function msg(data, reply, address){
    
}
