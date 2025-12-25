export interface CheckEmailResponse {
    exists: boolean;
    name?: string;
    error?: string;
}
export interface SignUpRequest {
    email: string;
    password: string;
}
export interface SignInResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    error?: string;
}
export interface SignUpResponse {
    success: boolean;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    error?: string;
}
//# sourceMappingURL=auth.types.d.ts.map