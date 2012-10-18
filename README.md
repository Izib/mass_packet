结构：
发包程序分为2个部分
1.	server：分布式的存在于各种类型机器上（windows或者linux）。用于发送大量数据包。1）文件结构.（sendPackets， log）主要功能由sendPackets.js完成。在对应目录下会有log文件产生，每次发包都会有一个新的log产生。为了查错，临时保留的。
2）功能. 启动sendPackets后，自动监听1636端口（默认，可以设置）。等待控制端任务。可以同时接受多个控制端的任务。得到任务后，利用异步模式，海量发包。成功返回控制端0，失败，返回错误码。
3）发包规则。Windows下利用IOCP（linux下epoll），异步快速推送指定的所有数据包。如果读取文件出错，返回控制机，操作出错。如果发包失败，则继续尝试发送下一个包。不会报错，但是会记录在log文件中。将得到的回复信息，存入数据库服务器。存储结构：
  var oneCollection = { 
                  sig: sig,
                  runMachine: os.hostname(),             
                  timeStamp: common.getDate(),
                  filePath: String(this.client._httpMessage.filePath),
                  timeStamp: common.getDate(),
                  responseTime: recvPoint-this.client._httpMessage.sendPoint,
                  responseStatus: res.statusCode,
                  headers: JSON.stringify(res.headers),
                  data: chunks, 
                  dataCrc: crc( chunks)
                };
响应时间已经可以准确获取。包含所有回复包的信息。Sig是为了在出错情况下，找到出错电脑保存的信息。runMachine是为了能回归寻找到发包的计算机。

2.	client：存在于控制机上。用于任务分发和容错处理。
1）	文件结构. （client， mapper(最后一行必须为空)， log， dispatch）主要功能由client.js完成。对应目录下，一样有一个log文件，记录分配任务的情况，以及出错的处理。同时还有mapper和dispatch文件夹。Mapper里面存放可以分派的电脑ip和端口。控制端通过mapper文件，获取分派电脑信息，这个需要手动录入。Dispatch目录下，保存分派的结果（每个被分派的电脑对应一个改目录下的文件，里面包含了它需要发送的包的信息。）如果，某一个电脑出错，将重新把dispatch下的任务分配给其他存活的电脑。
2）	功能。Client在通过统计需要发包的信息，生成dispatch下的分配任务。然后，连接server的1636端口（默认是1636），分配任务，并设置超时机制，如果超时或者返回错误，则调用容错函数，处理后，再次分配任务。

重要：
Mapper文件，最后必须空行。
Packets和dispatch目录需要共享出去，一遍server访问。
所有输出保存在对应执行目录下的log文件夹client只有一个log。Server有多个log。
每个跑server的PC。需要先有访问共享的权限。Linux需要mount后才可以访问。
