�ṹ��
���������Ϊ2������
1.	server���ֲ�ʽ�Ĵ����ڸ������ͻ����ϣ�windows����linux�������ڷ��ʹ������ݰ���1���ļ��ṹ.��sendPackets�� log����Ҫ������sendPackets.js��ɡ��ڶ�ӦĿ¼�»���log�ļ�������ÿ�η���������һ���µ�log������Ϊ�˲����ʱ�����ġ�
2������. ����sendPackets���Զ�����1636�˿ڣ�Ĭ�ϣ��������ã����ȴ����ƶ����񡣿���ͬʱ���ܶ�����ƶ˵����񡣵õ�����������첽ģʽ�������������ɹ����ؿ��ƶ�0��ʧ�ܣ����ش����롣
3����������Windows������IOCP��linux��epoll�����첽��������ָ�����������ݰ��������ȡ�ļ��������ؿ��ƻ������������������ʧ�ܣ���������Է�����һ���������ᱨ�����ǻ��¼��log�ļ��С����õ��Ļظ���Ϣ���������ݿ���������洢�ṹ��
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
��Ӧʱ���Ѿ�����׼ȷ��ȡ���������лظ�������Ϣ��Sig��Ϊ���ڳ�������£��ҵ�������Ա������Ϣ��runMachine��Ϊ���ܻع�Ѱ�ҵ������ļ������

2.	client�������ڿ��ƻ��ϡ���������ַ����ݴ���
1��	�ļ��ṹ. ��client�� mapper(���һ�б���Ϊ��)�� log�� dispatch����Ҫ������client.js��ɡ���ӦĿ¼�£�һ����һ��log�ļ�����¼���������������Լ�����Ĵ���ͬʱ����mapper��dispatch�ļ��С�Mapper�����ſ��Է��ɵĵ���ip�Ͷ˿ڡ����ƶ�ͨ��mapper�ļ�����ȡ���ɵ�����Ϣ�������Ҫ�ֶ�¼�롣DispatchĿ¼�£�������ɵĽ����ÿ�������ɵĵ��Զ�Ӧһ����Ŀ¼�µ��ļ����������������Ҫ���͵İ�����Ϣ���������ĳһ�����Գ��������°�dispatch�µ����������������ĵ��ԡ�
2��	���ܡ�Client��ͨ��ͳ����Ҫ��������Ϣ������dispatch�µķ�������Ȼ������server��1636�˿ڣ�Ĭ����1636�����������񣬲����ó�ʱ���ƣ������ʱ���߷��ش���������ݴ�����������ٴη�������

��Ҫ��
Mapper�ļ�����������С�
Packets��dispatchĿ¼��Ҫ�����ȥ��һ��server���ʡ�
������������ڶ�Ӧִ��Ŀ¼�µ�log�ļ���clientֻ��һ��log��Server�ж��log��
ÿ����server��PC����Ҫ���з��ʹ����Ȩ�ޡ�Linux��Ҫmount��ſ��Է��ʡ�
