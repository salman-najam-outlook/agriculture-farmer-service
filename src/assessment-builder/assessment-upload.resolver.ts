import {Args, Int, Mutation, Query, Resolver} from '@nestjs/graphql';
import {AssessmentUploads} from "./entities/assessment-uploads.entity";
import {AssessmentQuestions} from "./entities/assessment-questions.entity";
import {CreateAssessmentQuestionInput} from "./dto/create-assessment-question.input";
import {AssessmentUploadService} from "./assessment-upload.service";
import {AssessmentUploadResponse, CreateAssessmentUploadInput, UploadResponse} from "./dto/assessment-upload.input";
import {AssessmentQuestionService} from "./assessment-question.service";

@Resolver(()=>AssessmentUploads)
export class AssessmentUploadResolver {
    constructor(
        private readonly assessmentUploadService: AssessmentUploadService
    ) {}
    @Mutation(() => AssessmentUploadResponse)
    async createNewAssessmentUpload(
        @Args("createAssessmentUploadInput")
            createAssessmentUploadInput: CreateAssessmentUploadInput
    ) {
        return this.assessmentUploadService.create(createAssessmentUploadInput);
    }

    @Query(()=>UploadResponse)
    async getAllAssessmentFiles(
        @Args("assessmentId",  { type : ()=>Int , nullable: false}) assessmentId:number,
        @Args("diligenceReportId",  { type : ()=>Int , nullable: false}) diligenceReportId:number,
        @Args("productionPlaceId",  { type : ()=>Int , nullable: true}) productionPlaceId:number
    ){
        return this.assessmentUploadService.findAll(assessmentId, diligenceReportId, productionPlaceId);
    }

    @Mutation(() => AssessmentUploadResponse, { name: 'removeAssessmentFile'})
    async removeAssessmentFile(
        @Args("id", { type: () => Int, nullable: false }) id: number,
        @Args("assessmentId", { type: () => Int, nullable: false }) assessmentId: number,
        @Args("diligenceReportId", { type: () => Int, nullable: false }) diligenceReportId: number,
        @Args("productionPlaceId", { type: () => Int, nullable: true }) productionPlaceId: number,
        
    ) {
        return this.assessmentUploadService.deleteFile(id,assessmentId, diligenceReportId, productionPlaceId );
    }
}
