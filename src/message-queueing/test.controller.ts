import { Controller, Get } from '@nestjs/common';
import { MessageQueueingService } from './message-queueing.service';

@Controller("api/test/publish")
export class TestController {
  constructor(private readonly appService: MessageQueueingService) {}

  @Get()
  async getHello(): Promise<string> {
    await this.appService.publishNotification({
        notify:'admin', 
        type:'deforestation_report',
        	message:"Deforestation report generate. Tap here to review.",
          title:"Deforestation Report Generated!",
        	userId:879,
          users:[879],
            data:	'{"reportId":702,"fileDownloadUrl": "https://dimitra-cf-sass-api-geo-json-dev-public.s3.us-west-1.amazonaws.com/farm_1726047700489.geojson"}'

    });

return 'test publish'
  }
}
