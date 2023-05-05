import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { AuthUtils } from "../AuthUtils";
import { RegisterService } from "../generated/api/resources/api/resources/v1/resources/register/service/RegisterService";
import * as FernSerializers from "../generated/serialization";
import { writeBuffer } from "../serdeUtils";

export function getRegisterApiService(prisma: PrismaClient, authUtils: AuthUtils): RegisterService {
    return new RegisterService({
        registerApiDefinition: async (req, res) => {
            await authUtils.checkUserBelongsToOrg({ authHeader: req.headers.authorization, orgId: req.body.orgId });
            const apiDefinitionId = uuidv4();
            const jsonApiDefinition = await FernSerializers.api.v1.register.ApiDefinition.jsonOrThrow(
                req.body.definition
            );
            await prisma.apiDefinitionsV2.create({
                data: {
                    apiDefinitionId,
                    apiName: req.body.apiId,
                    orgId: req.body.orgId,
                    definition: writeBuffer(jsonApiDefinition),
                },
            });
            return res.send({
                apiDefinitionId,
            });
        },
    });
}