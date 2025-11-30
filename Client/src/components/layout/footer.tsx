"use client";


export function Footer() {
	return (
		<footer className="bg-muted/30 backdrop-blur-sm border-t border-border py-3">
			<div className="container mx-auto px-4">
				<div className="mt-6 text-center">
					<p className="text-xs text-muted-foreground">
						© {new Date().getFullYear()} Ridezon. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
